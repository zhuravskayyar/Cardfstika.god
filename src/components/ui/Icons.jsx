const iconStyle = { width: '100%', height: '100%', display: 'block' };

const renderIcon = (name) => {
  switch (name) {
    case 'swords': // Дуелі
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <defs>
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f2c94c" />
              <stop offset="100%" stopColor="#b08600" />
            </linearGradient>
          </defs>
          <path d="M14.5 17.5L3 6V3h3l11.5 11.5" fill="url(#gold-grad)" />
          <path d="M9.5 17.5L21 6V3h-3L6.5 14.5" fill="url(#gold-grad)" />
          <path d="M5 3l14 14" stroke="#fff" strokeWidth="1" opacity="0.3" />
        </svg>
      );

    case 'campaign': // Кампанія
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 20l4-8 4 4 4-10 8 14H2z" fill="rgba(0,210,255,0.2)" stroke="#00d2ff" />
          <circle cx="18" cy="6" r="2" fill="#00d2ff" />
        </svg>
      );

    case 'tournament': // Турнір
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h12v6a6 6 0 01-12 0V4z" fill="rgba(255,255,255,0.1)" stroke="#a0a0a0" strokeWidth="1.5" />
          <path d="M6 6H4a2 2 0 002 2M18 6h2a2 2 0 01-2 2" stroke="#a0a0a0" strokeWidth="1.5" />
          <path d="M10 16v2h4v-2" stroke="#a0a0a0" strokeWidth="1.5" />
          <path d="M8 20h8v2H8z" fill="#f2c94c" />
        </svg>
      );

    case 'arena': // Арена
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M3 20h18" stroke="#888" strokeWidth="1.5" />
          <path d="M5 20V10a7 7 0 0114 0v10" fill="rgba(100,100,100,0.3)" stroke="#888" strokeWidth="1.5" />
          <path d="M9 20v-4m6 4v-4M12 20v-6" stroke="#888" strokeWidth="1.5" />
          <path d="M12 6l2 4h-4l2-4z" fill="#f2c94c" />
        </svg>
      );

    case 'deck': // Бойова колода
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <rect x="6" y="4" width="8" height="12" rx="1" fill="#2a1f12" stroke="#888" strokeWidth="1.5" />
          <rect x="10" y="8" width="8" height="12" rx="1" fill="#5a2b2b" stroke="#888" strokeWidth="1.5" />
          <path d="M14 14c0-2-2-3-2-3s2-1 2-3-2-2-2-2 2 1 2 3" fill="#ff4500" stroke="#ff8c00" strokeWidth="1" />
        </svg>
      );

    case 'invasion': // Нашестя
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M12 4c-4 0-8 4-8 8s4 8 8 8 8-4 8-8-4-8-8-8z" fill="#2a0f0f" stroke="#ff4500" strokeWidth="1.5" />
          <path d="M4 8l4 4m12-4l-4 4" stroke="#ff4500" strokeWidth="2" />
          <path d="M9 10h2m2 0h2" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 14h6" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'tasks': // Завдання
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M6 4h12v16H6z" fill="rgba(255,255,255,0.05)" stroke="#ccc" strokeWidth="1.5" />
          <path d="M8 8h8M8 12h8M8 16h4" stroke="#00ff00" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'diamonds': // Діамантові нагороди
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M12 2L4 9l8 13 8-13-8-7z" fill="rgba(0,210,255,0.2)" stroke="#00d2ff" strokeWidth="1.5" />
          <path d="M4 9h16" stroke="#00d2ff" strokeWidth="1.5" />
        </svg>
      );

    case 'equipment': // Спорядження
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" fill="rgba(50,50,50,0.8)" stroke="#888" strokeWidth="1.5" />
          <path d="M12 6v12M8 10h8" stroke="#f2c94c" strokeWidth="2" />
        </svg>
      );

    case 'collections': // Колекції
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M4 6h16v14H4z" fill="#2a1f12" stroke="#888" strokeWidth="1.5" />
          <path d="M10 10h4v4h-4z" fill="#f2c94c" />
          <path d="M4 10h6M14 10h6M4 14h6M14 14h6" stroke="#888" strokeWidth="1" />
        </svg>
      );

    case 'best': // Лучшие (Медаль)
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <circle cx="12" cy="9" r="6" fill="rgba(255,215,0,0.15)" stroke="#ffd700" strokeWidth="1.5" />
          <path d="M9 15l-2 7 5-3 5 3-2-7" fill="#ffd700" />
          <path d="M12 5l1.5 3.5h3.5l-3 2 1 3.5L12 12l-3 2 1-3.5-3-2h3.5z" fill="#ffd700" stroke="#b08600" strokeWidth="0.5" />
        </svg>
      );

    case 'shop': // Магазин
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M4 4h16v4H4z" fill="rgba(255,255,255,0.1)" stroke="#ccc" strokeWidth="1.5" />
          <path d="M6 8v12h12V8" stroke="#ccc" strokeWidth="1.5" />
          <path d="M10 8v4a2 2 0 004 0V8" stroke="#f2c94c" strokeWidth="1.5" />
        </svg>
      );

    case 'gold': // Золота монета
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <defs>
            <linearGradient id="coin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f2c94c" />
              <stop offset="100%" stopColor="#b08600" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9" fill="url(#coin-grad)" stroke="#f2c94c" strokeWidth="1.5" />
          <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2a1f00">$</text>
        </svg>
      );

    case 'home': // Головна (Замок)
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M4 10l8-8 8 8v10H4z" fill="rgba(0,0,0,0.5)" stroke="#00d2ff" strokeWidth="1.5" />
          <path d="M9 20v-6h6v6" fill="#00d2ff" opacity="0.3" />
          <path d="M12 14v6" stroke="#00d2ff" strokeWidth="1.5" />
        </svg>
      );

    case 'profile': // Профіль (Шолом)
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M7 3h10v8a5 5 0 01-10 0V3z" fill="rgba(80,80,80,0.5)" stroke="#888" strokeWidth="1.5" />
          <path d="M5 5H3v4a2 2 0 002 2M19 5h2v4a2 2 0 01-2 2" stroke="#888" strokeWidth="1.5" />
          <path d="M9 14l1 4h4l1-4" stroke="#888" strokeWidth="1.5" />
        </svg>
      );

    case 'guild': // Гільдія (Щит)
      return (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <path d="M12 2l8 4v6c0 4-3 8-8 10-5-2-8-6-8-10V6l8-4z" fill="rgba(255,165,0,0.1)" stroke="#f2c94c" strokeWidth="1.5" />
          <path d="M8 12h8M12 8v8" stroke="#f2c94c" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default:
      return <span style={{ fontSize: '14px' }}>{name}</span>;
  }
};

export function Icon({ name, size = '24px', color, className = '', style = {} }) {
  return (
    <span
      className={`icon-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        color: color,
        flexShrink: 0,
        ...style,
      }}
    >
      {renderIcon(name)}
    </span>
  );
}
