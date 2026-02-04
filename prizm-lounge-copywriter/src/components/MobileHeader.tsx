'use client';

import { usePathname } from 'next/navigation';
import { SearchIcon } from './Icons';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/stations': 'Stations',
  '/schedule': 'Schedule',
  '/players': 'Players',
};

export default function MobileHeader() {
  const pathname = usePathname();

  // Get the page title based on the current path
  const getPageTitle = () => {
    // Exact match first
    if (PAGE_TITLES[pathname]) {
      return PAGE_TITLES[pathname];
    }
    // Check for nested routes (e.g., /players/123)
    for (const [path, title] of Object.entries(PAGE_TITLES)) {
      if (path !== '/' && pathname.startsWith(path)) {
        return title;
      }
    }
    return 'Prizm Lounge';
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
    <header className="mobile-header md:hidden">
      <div className="mobile-header-content">
        <h1 className="mobile-header-title">{getPageTitle()}</h1>
        <button
          onClick={openSearch}
          className="mobile-header-search"
          title="Search"
          aria-label="Search"
        >
          <SearchIcon size={20} />
        </button>
      </div>
    </header>
  );
}
