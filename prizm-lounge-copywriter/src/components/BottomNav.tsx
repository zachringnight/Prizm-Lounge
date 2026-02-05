'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { HomeIcon, UsersIcon, CalendarIcon, LayersIcon, SearchIcon, ClapperboardIcon, NoteIcon, TimerIcon, PrinterIcon, SettingsIcon, MoreHorizontalIcon } from './Icons';

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

const toolItems: NavItem[] = [
  { href: '/clip-markers', label: 'Clips', icon: ClapperboardIcon },
  { href: '/notes', label: 'Notes', icon: NoteIcon },
  { href: '/timer', label: 'Timer', icon: TimerIcon },
  { href: '/print', label: 'Print', icon: PrinterIcon },
  { href: '/admin', label: 'Admin', icon: SettingsIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { largeTextMode, toggleLargeTextMode, getOpenIssueCount } = useAppStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const openIssueCount = getOpenIssueCount();

  const handleNavClick = (href: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    router.push(href);
    setShowMoreMenu(false);
  };

  const openSearch = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  const isToolActive = toolItems.some(item =>
    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

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

        {/* More button for tools on mobile */}
        <div className="mobile-nav-item-wrapper">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`mobile-nav-item ${isToolActive || showMoreMenu ? 'active' : ''}`}
          >
            <MoreHorizontalIcon size={20} />
            <span>More</span>
          </button>

          {/* More menu dropdown */}
          {showMoreMenu && (
            <>
              <div
                className="mobile-more-overlay"
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="mobile-more-menu">
                {toolItems.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`mobile-more-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {item.href === '/notes' && openIssueCount > 0 && (
                        <span className="mobile-more-badge">{openIssueCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
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
          {/* Clip Markers Link */}
          <button
            onClick={() => handleNavClick('/clip-markers')}
            className={`desktop-tool-item ${pathname === '/clip-markers' ? 'active' : ''}`}
            title="Clip Markers"
          >
            <ClapperboardIcon size={18} />
            <span>Clips</span>
          </button>

          {/* Notes Link */}
          <button
            onClick={() => handleNavClick('/notes')}
            className={`desktop-tool-item ${pathname === '/notes' ? 'active' : ''}`}
            title="Notes & Issues"
            style={{ position: 'relative' }}
          >
            <NoteIcon size={18} />
            <span>Notes</span>
            {openIssueCount > 0 && (
              <span className="desktop-tool-badge">{openIssueCount}</span>
            )}
          </button>

          {/* Timer Link */}
          <button
            onClick={() => handleNavClick('/timer')}
            className={`desktop-tool-item ${pathname === '/timer' ? 'active' : ''}`}
            title="Timer"
          >
            <TimerIcon size={18} />
          </button>

          {/* Print Link */}
          <button
            onClick={() => handleNavClick('/print')}
            className={`desktop-tool-item ${pathname === '/print' ? 'active' : ''}`}
            title="Print"
          >
            <PrinterIcon size={18} />
          </button>

          {/* Admin Link */}
          <button
            onClick={() => handleNavClick('/admin')}
            className={`desktop-tool-item ${pathname === '/admin' ? 'active' : ''}`}
            title="Admin Settings"
          >
            <SettingsIcon size={18} />
          </button>

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
