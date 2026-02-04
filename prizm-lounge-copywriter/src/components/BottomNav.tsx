'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { HomeIcon, UsersIcon, CalendarIcon, LayersIcon, SearchIcon } from './Icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/stations', label: 'Stations', icon: LayersIcon },
  { href: '/schedule', label: 'Schedule', icon: CalendarIcon },
  { href: '/players', label: 'Players', icon: UsersIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { largeTextMode, toggleLargeTextMode } = useAppStore();

  const handleNavClick = (href: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    router.push(href);
  };

  const openSearch = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="desktop-nav hidden md:flex">
        <button
          onClick={() => handleNavClick('/')}
          className="desktop-nav-brand"
        >
          <span className="text-[var(--panini-red)] font-bold">Prizm</span>{' '}
          <span className="text-[var(--panini-yellow)] font-bold">Lounge</span>
        </button>

        <div className="desktop-nav-center">
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

        <div className="desktop-nav-right">
          {/* Search Trigger */}
          <button
            onClick={openSearch}
            className="desktop-search"
            title="Search (Cmd+K)"
          >
            <SearchIcon size={16} />
            <kbd>⌘K</kbd>
          </button>

          {/* Large Text Mode Toggle */}
          <button
            onClick={toggleLargeTextMode}
            className={`text-size-toggle ${largeTextMode ? 'active' : ''}`}
            title="Toggle large text mode"
          >
            Aa
          </button>
        </div>
      </nav>
    </>
  );
}
