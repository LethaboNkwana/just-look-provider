import React from 'react';

export default function Nav({ active, onNavigate, user }) {
  const items = [
  { key: 'home', label: 'Overview' },
  { key: 'screens', label: 'Screens' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' }
  ];

  const onKey = (e, key) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(key);
    }
  };

  return (
    <nav className="nav" role="navigation" aria-label="Dashboard Navigation">
      <div className="nav-brand">
        <div className="logo">JustLoook</div>
        <div className="muted small">Provider</div>
      </div>

      <ul className="nav-list" role="menu">
        {items.map(item => (
          <li
            key={item.key}
            role="menuitem"
            aria-current={active === item.key ? 'page' : undefined}
            className={`nav-item ${active === item.key ? 'active' : ''}`}
            tabIndex={0}
            onClick={() => onNavigate(item.key)}
            onKeyDown={(e) => onKey(e, item.key)}
          >
            {item.label}
          </li>
        ))}
      </ul>

      <div className="nav-footer" aria-hidden={user ? 'false' : 'true'}>
        <div className="small muted">Signed in as</div>
        <div className="small">{user?.email}</div>
      </div>
    </nav>
  );
}
