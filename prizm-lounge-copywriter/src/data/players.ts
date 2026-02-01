import { Player } from '@/types';

export const players: Player[] = [
  // CURRENT NFL STARS
  {
    id: 'trevor-lawrence',
    name: 'Trevor Lawrence',
    category: 'Current',
    team: 'Jacksonville Jaguars',
    position: 'QB',
    keyStats: [
      '2025: MVP finalist, Comeback POY finalist',
      '13-4 record, AFC South champs',
      '38 total TDs (franchise record)',
      '#1 overall pick, 2021 NFL Draft'
    ],
    definingMoments: [
      'Game-winning drive vs Chiefs on Monday Night Football',
      '5 TD / 300 yard game vs Jets',
      'First QB to lead JAX to back-to-back playoffs since Mark Brunell',
      'Led Jaguars to AFC South title in 2025'
    ],
    cardHistory: [
      '2021 Prizm rookie is a cornerstone card',
      'Heavy auto inventory across all products',
      'Silver Prizm RC consistently top seller',
      'Downtown insert highly sought after'
    ],
    personalDetails: [
      'Clemson National Champion',
      '#1 overall pick 2021',
      'Married to Marissa',
      'Known for the legendary hair',
      'Cartersville, Georgia native'
    ],
    schedule: {
      day: 'Thursday',
      date: 'Feb 6',
      startTime: '14:00',
      endTime: '15:30'
    }
  },
  {
    id: 'aidan-hutchinson',
    name: 'Aidan Hutchinson',
    category: 'Current',
    team: 'Detroit Lions',
    position: 'DE',
    keyStats: [
      '2025: 14.5 sacks (4th in NFL)',
      '$180M contract extension',
      'Played all 17 games after devastating 2024 leg injury',
      '#2 overall pick, 2022 NFL Draft'
    ],
    definingMoments: [
      '4.5 sack game vs Bucs in 2024 before injury',
      'INT + sack vs Stafford and Rams',
      'Anchor of Lions defensive identity',
      'Comeback from leg injury that looked career-threatening'
    ],
    cardHistory: [
      '2022 Prizm rookie card',
      'Detroit hometown hero premium on all cards',
      'Michigan Wolverines college cards valuable',
      'Auto cards consistently strong sellers'
    ],
    personalDetails: [
      'Michigan Man through and through',
      '#2 overall pick 2022',
      'House of Hutch charity foundation',
      'Dad Chris played in the NFL',
      'Plymouth, Michigan native'
    ],
    schedule: {
      day: 'Thursday',
      date: 'Feb 6',
      startTime: '16:00',
      endTime: '17:30'
    }
  },
  {
    id: 'garrett-wilson',
    name: 'Garrett Wilson',
    category: 'Current',
    team: 'New York Jets',
    position: 'WR',
    keyStats: [
      '2025: Shut down mid-season (knee)',
      '$130M contract extension',
      'On pace for 1,100+ yards and 11 TDs before injury',
      'Back-to-back-to-back 1,000 yard seasons to start career'
    ],
    definingMoments: [
      '2022 Offensive Rookie of the Year',
      'Three consecutive 1,000 yard seasons',
      'Elite route runner with best hands in the game',
      'Became Jets WR1 from day one'
    ],
    cardHistory: [
      '2022 Prizm rookie card',
      'Ohio State pedigree adds value',
      'OROY cards got massive bump',
      'Watch for 2026 comeback narrative to spike prices'
    ],
    personalDetails: [
      'Ohio State Buckeye',
      '#10 overall pick 2022',
      'Elite hands, even better routes',
      'Columbus, Ohio native',
      '"Watch this in 2026" energy'
    ],
    schedule: {
      day: 'Friday',
      date: 'Feb 7',
      startTime: '11:00',
      endTime: '12:30'
    }
  },

  // PROSPECT
  {
    id: 'dante-moore',
    name: 'Dante Moore',
    category: 'Prospect',
    team: 'Oregon Ducks',
    position: 'QB',
    keyStats: [
      '2025: Led Ducks to CFP run (10-1)',
      '72% completion percentage',
      '30 touchdowns',
      'Returning to school for 2026 season'
    ],
    definingMoments: [
      'Beat Penn State in the whiteout game',
      'Poised beyond his years under pressure',
      'Transferred from UCLA, sat behind Dillon Gabriel',
      'Emerged as best QB in college football'
    ],
    cardHistory: [
      'Bowman University cards available now',
      'Early Prizm Draft Picks—get in before the NFL hype',
      'College parallels still affordable',
      'Smart money is moving now before 2027 Draft'
    ],
    personalDetails: [
      'Detroit native (MLK High School)',
      'Projected 2027 #1 overall pick',
      'Pure passer with quiet confidence',
      'Five-star recruit out of high school',
      'The next franchise QB'
    ],
    schedule: {
      day: 'Saturday',
      date: 'Feb 8',
      startTime: '10:00',
      endTime: '11:00'
    }
  },

  // LEGENDS
  {
    id: 'julian-edelman',
    name: 'Julian Edelman',
    category: 'Legend',
    team: 'New England Patriots',
    position: 'WR',
    keyStats: [
      '3x Super Bowl Champion',
      'Super Bowl LIII MVP',
      '620 career receptions',
      '6,822 career receiving yards'
    ],
    definingMoments: [
      'THE CATCH vs Falcons in Super Bowl LI (28-3 comeback)',
      'Super Bowl LIII MVP performance vs Rams',
      'Most clutch postseason receiver of his generation',
      'Converted from college QB to Super Bowl MVP WR'
    ],
    cardHistory: [
      'Undervalued for years—market is correcting',
      'Super Bowl MVP cards are the chase',
      'Playoff performance cards premium',
      'Kent State cards for the deep collectors'
    ],
    personalDetails: [
      'Kent State QB converted to WR',
      'Playoff legend, built for January',
      'Now media personality and analyst',
      'Redwood City, California native',
      'Undrafted in 2009, became a champion'
    ],
    schedule: {
      day: 'Friday',
      date: 'Feb 7',
      startTime: '14:00',
      endTime: '15:30'
    }
  },
  {
    id: 'ty-law',
    name: 'Ty Law',
    category: 'Legend',
    team: 'New England Patriots',
    position: 'CB',
    keyStats: [
      '3x Super Bowl Champion',
      '5x Pro Bowl selection',
      '53 career interceptions',
      'Pro Football Hall of Fame Class of 2019'
    ],
    definingMoments: [
      '3 INTs vs Peyton Manning in 2003 AFC Championship',
      'Defined the early Patriots dynasty defense',
      'Changed the way receivers were defended',
      'Locked down the best WRs of his era'
    ],
    cardHistory: [
      'Late 90s/early 2000s inserts are the chase',
      'HOF induction gave cards a bump',
      'Topps Chrome and Bowman from that era',
      'Patriots dynasty cards always in demand'
    ],
    personalDetails: [
      'Aliquippa, Pennsylvania product',
      'Hall of Fame Class of 2019',
      'Lockdown corner who changed the game',
      'Michigan Wolverine',
      '#23 overall pick, 1995'
    ],
    schedule: {
      day: 'Thursday',
      date: 'Feb 6',
      startTime: '11:00',
      endTime: '12:30'
    }
  },
  {
    id: 'malcolm-butler',
    name: 'Malcolm Butler',
    category: 'Legend',
    team: 'New England Patriots',
    position: 'CB',
    keyStats: [
      '2x Super Bowl Champion',
      'Pro Bowl selection',
      'Super Bowl XLIX hero',
      'Made the most iconic play in Super Bowl history'
    ],
    definingMoments: [
      'THE INTERCEPTION—goal line pick to seal Super Bowl XLIX vs Seahawks',
      'Most iconic play in Super Bowl history',
      'Read the play, jumped the route, saved the game',
      'From undrafted to legend in one play'
    ],
    cardHistory: [
      'Cards spiked immediately after that play',
      'Remains a moment card forever',
      'Super Bowl insert cards are the grail',
      'Value tied to one of sports\' greatest moments'
    ],
    personalDetails: [
      'Undrafted free agent',
      'Worked at Popeyes before the NFL',
      'Ultimate underdog story',
      'Vicksburg, Mississippi native',
      'From unknown to immortal'
    ],
    schedule: {
      day: 'Friday',
      date: 'Feb 7',
      startTime: '16:00',
      endTime: '17:00'
    }
  },
  {
    id: 'eli-manning',
    name: 'Eli Manning',
    category: 'Legend',
    team: 'New York Giants',
    position: 'QB',
    keyStats: [
      '2x Super Bowl Champion',
      '2x Super Bowl MVP',
      '57,023 career passing yards',
      '366 career touchdown passes'
    ],
    definingMoments: [
      'Helmet Catch drive in Super Bowl XLII',
      'Manningham sideline throw in Super Bowl XLVI',
      'Beat the undefeated Patriots',
      'Beat the Patriots again four years later'
    ],
    cardHistory: [
      '2004 rookie class with Big Ben and Rivers',
      'Super Bowl MVP cards are iconic',
      'Giants jersey cards premium',
      'Canton-bound, prices will rise'
    ],
    personalDetails: [
      'The Manning family legacy',
      'Canton bound, no question',
      'Clutch gene personified',
      'Now beloved for his humor',
      'New Orleans native—hometown hero'
    ],
    schedule: {
      day: 'Saturday',
      date: 'Feb 8',
      startTime: '14:00',
      endTime: '16:00'
    }
  },
  {
    id: 'ricky-williams',
    name: 'Ricky Williams',
    category: 'Legend',
    team: 'Miami Dolphins',
    position: 'RB',
    keyStats: [
      'Heisman Trophy winner (Texas)',
      '10,009 career rushing yards',
      '66 career rushing touchdowns',
      'Broke Tony Dorsett\'s NCAA rushing record'
    ],
    definingMoments: [
      'Broke Tony Dorsett\'s NCAA rushing record at Texas',
      'Dreads and visor era in Miami—iconic look',
      'One of the most electric backs ever',
      'Saints traded entire 1999 draft to get him'
    ],
    cardHistory: [
      '1999 rookie class cards',
      'Heisman Trophy premium',
      'Cult following in the hobby',
      'Texas Longhorns cards highly collectible'
    ],
    personalDetails: [
      'New Orleans Draft Day trade (entire draft for one pick)',
      'Outspoken, unique personality',
      'Connects to NOLA—perfect for this event',
      'San Diego, California native',
      'Texas Longhorns legend'
    ],
    schedule: {
      day: 'Thursday',
      date: 'Feb 6',
      startTime: '18:00',
      endTime: '19:30'
    }
  },
  {
    id: 'champ-bailey',
    name: 'Champ Bailey',
    category: 'Legend',
    team: 'Denver Broncos',
    position: 'CB',
    keyStats: [
      '12x Pro Bowl selection',
      '3x First-Team All-Pro',
      '52 career interceptions',
      'Pro Football Hall of Fame Class of 2019'
    ],
    definingMoments: [
      '100-yard INT return vs Tom Brady in 2005 AFC Championship (called back but iconic)',
      'Shutdown corner for a decade',
      'Matched up against the best and won',
      'Greatest cover corner of his generation'
    ],
    cardHistory: [
      'Early 2000s Bowman/Topps Chrome',
      'Hall of Fame spike in 2019',
      'Broncos and Redskins cards both collectible',
      'Georgia Bulldogs college cards'
    ],
    personalDetails: [
      'Georgia Bulldogs legend',
      '#7 overall pick, 1999',
      'Greatest cover corner of his generation',
      'Smooth and cerebral player',
      'Folkston, Georgia native'
    ],
    schedule: {
      day: 'Saturday',
      date: 'Feb 8',
      startTime: '11:30',
      endTime: '13:00'
    }
  }
];

// Helper functions
export function getPlayerById(id: string): Player | undefined {
  return players.find(p => p.id === id);
}

export function getPlayersByCategory(category: Player['category']): Player[] {
  return players.filter(p => p.category === category);
}

export function getPlayersByDay(day: 'Thursday' | 'Friday' | 'Saturday'): Player[] {
  return players.filter(p => p.schedule?.day === day);
}

export function searchPlayers(query: string): Player[] {
  const lowerQuery = query.toLowerCase();
  return players.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.team.toLowerCase().includes(lowerQuery) ||
    p.position.toLowerCase().includes(lowerQuery)
  );
}
