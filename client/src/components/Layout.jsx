import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report' },
  { to: '/education', label: 'Learn' },
  { to: '/legal', label: 'Legal Aid' },
  { to: '/admin', label: 'Admin' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div className={`app-wrapper${isHome ? ' app-wrapper--home' : ''}`}>
      <header className={`app-header${isHome ? ' app-header--home' : ''}`}>
        <div className="app-header-bar">
          <Link
            to="/"
            className={`app-logo${isHome ? ' app-logo--home' : ''}`}
          >
            <img
              src="/images/logo.svg"
              alt="Safe Digital Ecosystem logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/IMAGES/LOGO.png';
              }}
            />
            <span>SAFE Digital Ecosystem</span>
          </Link>
          <div className="app-header-actions">
            <ThemeToggle variant={isHome ? 'home' : 'default'} />
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={navOpen}
              aria-controls="main-nav"
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setNavOpen((o) => !o)}
            >
              {navOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        <nav
          id="main-nav"
          className={`app-nav${navOpen ? ' is-open' : ''}`}
        >
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`app-nav-link${isHome ? ' app-nav-link--home' : ''}${
                location.pathname === to ? ' app-nav-link--active' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className={`app-main${isHome ? ' app-main--home' : ''}`}>
        {children}
      </main>
      <footer className={`app-footer${isHome ? ' app-footer--home' : ''}`}>
        For students. Report anonymously or with your details. Your voice matters.
      </footer>
    </div>
  );
}
