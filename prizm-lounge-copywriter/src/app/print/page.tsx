'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { formatTime, EVENT_CONFIG, DayDate } from '@/types';

type PrintType = 'daily' | 'station' | 'players' | 'prcalls';

const PRINT_TYPES: { value: PrintType; label: string; icon: string }[] = [
  { value: 'daily', label: 'Daily Schedule', icon: '📅' },
  { value: 'station', label: 'Station Sheet', icon: '📍' },
  { value: 'players', label: 'Player Cards', icon: '🏈' },
  { value: 'prcalls', label: 'PR Calls', icon: '📞' },
];

const DAY_LABELS: Record<string, string> = {
  '2026-02-05': 'Thursday, Feb 5',
  '2026-02-06': 'Friday, Feb 6',
  '2026-02-07': 'Saturday, Feb 7',
};

export default function PrintPage() {
  const { players } = useAppStore();

  const [printType, setPrintType] = useState<PrintType>('daily');
  const [selectedDay, setSelectedDay] = useState<DayDate>('2026-02-05');
  const [selectedStation, setSelectedStation] = useState<string>('all');

  // Get players with schedules for the selected day
  const scheduledPlayers = useMemo(() => {
    return players.filter(p => {
      if (!p.schedule) return false;
      const scheduleDate = {
        'Thursday': '2026-02-05',
        'Friday': '2026-02-06',
        'Saturday': '2026-02-07',
      }[p.schedule.day];
      return scheduleDate === selectedDay;
    }).sort((a, b) => {
      if (!a.schedule || !b.schedule) return 0;
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    });
  }, [players, selectedDay]);

  // Get players with PR calls
  const playersWithPRCalls = useMemo(() => {
    return players.filter(p => {
      if (!p.schedule?.commitments) return false;
      return p.schedule.commitments.some(c => c.type === 'PR Hold' || c.station === 'PR Interview');
    });
  }, [players]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-page">
      {/* Header */}
      <div className="print-header">
        <h1>Print Schedules</h1>
        <p>Generate printable schedules and call sheets</p>
      </div>

      {/* Print Type Selector */}
      <div className="print-type-selector">
        {PRINT_TYPES.map(type => (
          <button
            key={type.value}
            className={`print-type-btn ${printType === type.value ? 'active' : ''}`}
            onClick={() => setPrintType(type.value)}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      {/* Options */}
      <div className="print-options">
        {(printType === 'daily' || printType === 'station') && (
          <div className="print-option">
            <label>Day</label>
            <select
              className="input select"
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value as DayDate)}
            >
              {EVENT_CONFIG.dates.map(date => (
                <option key={date} value={date}>
                  {DAY_LABELS[date] || date}
                </option>
              ))}
            </select>
          </div>
        )}

        {printType === 'station' && (
          <div className="print-option">
            <label>Station</label>
            <select
              className="input select"
              value={selectedStation}
              onChange={e => setSelectedStation(e.target.value)}
            >
              <option value="all">All Stations</option>
              <option value="LED Wall">LED Wall</option>
              <option value="Signing">Signing</option>
              <option value="PR Interview">PR Interview</option>
              <option value="Pack Rips">Pack Rips</option>
              <option value="Kid Reporter">Kid Reporter</option>
              <option value="Custom Gifting">Custom Gifting</option>
            </select>
          </div>
        )}
      </div>

      {/* Print Button */}
      <button className="print-btn" onClick={handlePrint}>
        🖨️ Print
      </button>

      {/* Print Preview */}
      <div className="print-preview">
        {/* Daily Schedule */}
        {printType === 'daily' && (
          <>
            <h2>Prizm Lounge Daily Schedule</h2>
            <h3>{DAY_LABELS[selectedDay]}</h3>

            {scheduledPlayers.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
                No players scheduled for this day.
              </p>
            ) : (
              <table className="print-schedule-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Position</th>
                    <th>Stations</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledPlayers.map(player => (
                    <tr key={player.id}>
                      <td>
                        {player.schedule ? `${formatTime(player.schedule.startTime)} - ${formatTime(player.schedule.endTime)}` : '-'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{player.name}</td>
                      <td>{player.team}</td>
                      <td>{player.position}</td>
                      <td>
                        {player.schedule?.commitments?.map(c => c.station).join(', ') || 'TBD'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Station Sheet */}
        {printType === 'station' && (
          <>
            <h2>{selectedStation === 'all' ? 'All Stations' : selectedStation} Schedule</h2>
            <h3>{DAY_LABELS[selectedDay]}</h3>

            <table className="print-schedule-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Player</th>
                  <th>{selectedStation === 'all' ? 'Station' : 'Activity'}</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {scheduledPlayers
                  .filter(p => {
                    if (selectedStation === 'all') return true;
                    return p.schedule?.commitments?.some(c => c.station === selectedStation);
                  })
                  .flatMap(player => {
                    const commitments = player.schedule?.commitments || [];
                    const filtered = selectedStation === 'all'
                      ? commitments
                      : commitments.filter(c => c.station === selectedStation);

                    if (filtered.length === 0) {
                      return [{
                        player,
                        time: player.schedule ? `${formatTime(player.schedule.startTime)}` : '',
                        station: 'TBD',
                        notes: ''
                      }];
                    }

                    return filtered.map(c => ({
                      player,
                      time: `${formatTime(c.startTime)} - ${formatTime(c.endTime)}`,
                      station: selectedStation === 'all' ? c.station : c.type,
                      notes: c.notes || ''
                    }));
                  })
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((item, idx) => (
                    <tr key={`${item.player.id}-${idx}`}>
                      <td>{item.time}</td>
                      <td style={{ fontWeight: 600 }}>{item.player.name}</td>
                      <td>{item.station}</td>
                      <td style={{ fontSize: '11px', color: '#666' }}>{item.notes}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        {/* Player Cards */}
        {printType === 'players' && (
          <>
            <h2>Player Reference Cards</h2>
            <h3>{EVENT_CONFIG.name}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '20px' }}>
              {players.slice(0, 20).map(player => (
                <div
                  key={player.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    pageBreakInside: 'avoid'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    {player.position} | {player.team}
                  </div>
                  <div style={{ fontSize: '10px', marginBottom: '4px' }}>
                    <strong>Key Stats:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {player.keyStats.slice(0, 2).map((stat, i) => (
                        <li key={i}>{stat}</li>
                      ))}
                    </ul>
                  </div>
                  {player.schedule && (
                    <div style={{ fontSize: '10px', marginTop: '8px', padding: '4px 8px', background: '#f5f5f5', borderRadius: '4px' }}>
                      {player.schedule.day} @ {formatTime(player.schedule.startTime)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* PR Calls */}
        {printType === 'prcalls' && (
          <>
            <h2>PR Call Sheet</h2>
            <h3>{EVENT_CONFIG.name}</h3>

            {playersWithPRCalls.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
                No PR calls scheduled.
              </p>
            ) : (
              <table className="print-schedule-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {playersWithPRCalls.map(player => {
                    const prCommitments = player.schedule?.commitments?.filter(
                      c => c.type === 'PR Hold' || c.station === 'PR Interview'
                    ) || [];

                    return prCommitments.map((c, idx) => (
                      <tr key={`${player.id}-${idx}`}>
                        <td>{player.schedule?.day}</td>
                        <td>{formatTime(c.startTime)} - {formatTime(c.endTime)}</td>
                        <td style={{ fontWeight: 600 }}>{player.name}</td>
                        <td>{player.team}</td>
                        <td style={{ fontSize: '11px' }}>{c.notes || '-'}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
