import React from 'react';

export default function Analytics({ screens, bookings }) {
  // lightweight summary view — can be wired to charts later
  const totalScreens = screens?.length || 0;
  const totalBookings = bookings?.length || 0;

  return (
    <div className="card" aria-label="Analytics">
      <h3>Analytics</h3>
      <p className="muted">Quick performance summary</p>
      <div className="grid-2" style={{marginTop:12}}>
        <div className="stat card">
          <div className="muted small">Screens</div>
          <div className="value">{totalScreens}</div>
        </div>
        <div className="stat card">
          <div className="muted small">Bookings (recent)</div>
          <div className="value">{totalBookings}</div>
        </div>
      </div>
      <p className="muted" style={{marginTop:12}}>Detailed charts coming soon.</p>
    </div>
  );
}
