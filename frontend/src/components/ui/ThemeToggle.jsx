import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ onBrand = false }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 group ${
        onBrand
          ? 'bg-white/15 border border-white/25 hover:bg-white/25 text-[#ffe9a8]'
          : 'bg-surface-container-high hover:bg-surface-container-highest'
      }`}
      aria-label={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
      title={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
    >
      {/* Sun Icon - Light Mode */}
      <span
        className={`material-symbols-outlined absolute transition-all duration-300 ${
          isDark
            ? 'opacity-0 rotate-180 scale-0'
            : `opacity-100 rotate-0 scale-100 ${onBrand ? 'text-[#ffe9a8]' : 'text-primary'}`
        }`}
      >
        light_mode
      </span>

      {/* Moon Icon - Dark Mode */}
      <span
        className={`material-symbols-outlined absolute transition-all duration-300 ${
          isDark
            ? `opacity-100 rotate-0 scale-100 ${onBrand ? 'text-[#ffe9a8]' : 'text-primary'}`
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
