import { useTheme } from '../context/ThemeContext';

/** Compact toggle for the header (all pages) */
export default function ThemeToggle({ variant = 'default' }) {
  const { theme, toggleTheme } = useTheme();
  const isHome = variant === 'home';

  return (
    <button
      type="button"
      className={`theme-toggle${isHome ? ' theme-toggle--home' : ''}`}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
      <span className="theme-toggle-label">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
