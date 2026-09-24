import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-all duration-300 group"
      aria-label={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
      title={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
    >
      {/* Sun Icon - Light Mode */}
      <span
        className={`material-symbols-outlined absolute transition-all duration-300 ${
          isDark
            ? 'opacity-0 rotate-180 scale-0'
            : 'opacity-100 rotate-0 scale-100 text-primary'
        }`}
      >
        light_mode
      </span>

      {/* Moon Icon - Dark Mode */}
      <span
        className={`material-symbols-outlined absolute transition-all duration-300 ${
          isDark
            ? 'opacity-100 rotate-0 scale-100 text-primary'
            : 'opacity-0 -rotate-180 scale-0'
        }`}
      >
        dark_mode
      </span>

      {/* Hover Effect Ring */}
      <span className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-all duration-300" />
    </button>
  );
};

export default ThemeToggle;
