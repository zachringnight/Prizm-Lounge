'use client';

import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, UsersIcon, CalendarIcon, ClipboardIcon } from './Icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/schedule', label: 'Schedule', icon: CalendarIcon },
  { href: '/players', label: 'Players', icon: UsersIcon },
  { href: '/deliverables', label: 'Deliverables', icon: ClipboardIcon },
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
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
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

      {/* Desktop Top Navigation */}
      <nav className="desktop-nav hidden md:flex">
        <div className="desktop-nav-brand">
          <span className="text-[var(--panini-red)] font-bold">Prizm</span>{' '}
          <span className="text-[var(--panini-yellow)] font-bold">Lounge</span>
        </div>
        <div className="desktop-nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
