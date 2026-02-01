'use client';

import { usePathname, useRouter } from 'next/navigation';
import { GridIcon, UsersIcon, CalendarIcon, PenIcon, SettingsIcon } from './Icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Generate', icon: PenIcon },
  { href: '/players', label: 'Players', icon: UsersIcon },
  { href: '/schedule', label: 'Schedule', icon: CalendarIcon },
  { href: '/tracking', label: 'Tracking', icon: GridIcon },
  { href: '/admin', label: 'Admin', icon: SettingsIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (href: string) => {
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    router.push(href);
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <button
            key={item.href}
            onClick={() => handleNavClick(item.href)}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
