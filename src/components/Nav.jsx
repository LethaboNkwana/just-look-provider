import React, { useState } from 'react';

// mobileOpen (boolean) and setMobileOpen (fn) are optional controlled props
export default function Nav({ active, onNavigate, user, mobileOpen, setMobileOpen }) {
  const [open, setOpen] = useState(false);
  const overlayOpen = typeof mobileOpen === 'boolean' ? mobileOpen : open;
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
    <>
      <nav className="nav" role="navigation" aria-label="Dashboard Navigation">
        <div className="nav-brand">
          <div className="logo">JustLoook</div>
          <div className="muted small">Provider</div>
        </div>

        <button className="nav-hamburger" aria-label="Open menu" onClick={() => {
          if (typeof setMobileOpen === 'function') setMobileOpen(true); else setOpen(true);
        }} aria-expanded={overlayOpen}>
          <span />
          <span />
          <span />
        </button>

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

      {/* Mobile overlay menu */}
      {overlayOpen && (
        <div className="mobile-nav-overlay" role="dialog" aria-modal="true">
          <div className="mobile-nav">
            <div className="mobile-nav-header">
              <div className="logo">JustLoook</div>
              <button className="nav-close" aria-label="Close menu" onClick={() => {
                if (typeof setMobileOpen === 'function') setMobileOpen(false); else setOpen(false);
              }}>Close</button>
            </div>
            <ul className="nav-list" role="menu">
              {items.map(item => (
                <li key={item.key}
                  role="menuitem"
                  className={`nav-item ${active === item.key ? 'active' : ''}`}
                  onClick={() => {
                    if (typeof setMobileOpen === 'function') setMobileOpen(false); else setOpen(false);
                    onNavigate(item.key);
                  }}
                  tabIndex={0}
                >{item.label}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
