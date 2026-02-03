'use client';

import { useState, useEffect } from 'react';
import { getEventDay } from '@/lib/schedule-utils';

interface DateTimeDisplayProps {
  showDayIndicator?: boolean;
  className?: string;
}

export default function DateTimeDisplay({ showDayIndicator = true, className = '' }: DateTimeDisplayProps) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [eventDay, setEventDay] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const ptTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

      // Format time with seconds
      const hours = ptTime.getHours();
      const minutes = ptTime.getMinutes();
      const seconds = ptTime.getSeconds();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

      setTime(
        `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period} PT`
      );

      // Format date
      setDate(
        ptTime.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );

      setEventDay(getEventDay());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDayEmoji = () => {
    switch (eventDay) {
      case 1:
        return '1️⃣';
      case 2:
        return '2️⃣';
      case 3:
        return '3️⃣';
      default:
        return '📅';
    }
  };

  const getDayLabel = () => {
    switch (eventDay) {
      case 1:
        return 'Day 1 of Event';
      case 2:
        return 'Day 2 of Event';
      case 3:
        return 'Day 3 of Event';
      default:
        return 'Event Coming Soon';
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white">
        {time || '--:--:-- -- PT'}
      </div>
      <div className="text-sm text-gray-400 mt-1">{date}</div>
      {showDayIndicator && (
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
          <span className="text-lg">{getDayEmoji()}</span>
          <span className="text-sm font-medium text-gray-300">{getDayLabel()}</span>
        </div>
      )}
    </div>
  );
}
