import { useTheme } from '../context/ThemeContext';

/** Full theme picker for the home page */
export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-selector" role="group" aria-label="Appearance">
      <div className="theme-selector-header">
        <span className="theme-selector-icon" aria-hidden="true">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
        <div>
          <h2 className="theme-selector-title">Appearance</h2>
          <p className="theme-selector-desc">
            Choose light or dark mode. Your preference applies across all pages.
          </p>
        </div>
      </div>
      <div className="theme-selector-options">
        <button
          type="button"
          className={`theme-option${theme === 'light' ? ' theme-option--active' : ''}`}
          onClick={() => setTheme('light')}
          aria-pressed={theme === 'light'}
        >
          <span className="theme-option-icon" aria-hidden="true">☀️</span>
          <span className="theme-option-label">Light mode</span>
          <span className="theme-option-hint">Bright, easy to read in daylight</span>
        </button>
        <button
          type="button"
          className={`theme-option${theme === 'dark' ? ' theme-option--active' : ''}`}
          onClick={() => setTheme('dark')}
          aria-pressed={theme === 'dark'}
        >
          <span className="theme-option-icon" aria-hidden="true">🌙</span>
          <span className="theme-option-label">Dark mode</span>
          <span className="theme-option-hint">Reduced glare, comfortable at night</span>
        </button>
      </div>
    </div>
  );
}
