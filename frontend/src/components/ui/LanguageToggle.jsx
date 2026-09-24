function LanguageToggle({ language, setLanguage }) {
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2 bg-surface-container-high px-2 py-1 rounded-full text-on-surface-variant font-label-sm text-label-sm">
      <button
        onClick={() => handleLanguageChange('vn')}
        className={`px-2 py-0.5 rounded-full transition-all ${
          language === 'vn'
            ? 'text-on-primary bg-primary font-semibold shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
        aria-label="Switch to Vietnamese"
      >
        VN
      </button>
      <span className="text-on-surface-variant/40">/</span>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-0.5 rounded-full transition-all ${
          language === 'en'
            ? 'text-on-primary bg-primary font-semibold shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}

export default LanguageToggle;
