import React from 'react';

export default function Bookings({ bookings = [], screens = [] }) {
  const screenMap = (screens || []).reduce((m, s) => { m[s.id] = s; return m; }, {});

  if (!bookings || bookings.length === 0) {
    return (
      <div className="card" aria-label="Bookings">
        <h3>Bookings</h3>
        <p className="muted">No bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="card" aria-label="Bookings">
      <h3>Bookings</h3>
      <ul className="booking-list">
        {bookings.map(b => (
          <li key={b.id} className="booking-item">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <strong>{b.advertiserName || 'Advertiser'}</strong>
                <div className="muted">{b.date} • {b.timeSlots?.length || 0} slots</div>
                <div className="muted">Screen: {screenMap[b.screenId]?.name || 'Unknown'}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div><strong>R{Number(b.revenue || 0).toLocaleString()}</strong></div>
                <div className="status booked">{b.status || 'Booked'}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
