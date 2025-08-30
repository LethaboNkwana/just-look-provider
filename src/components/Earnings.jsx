// src/components/Earnings.jsx
import React from 'react';

export default function Earnings({ bookings }) {
  const total = (bookings || []).reduce((sum, b) => sum + (Number(b.revenue) || 0), 0);
  const lastPayout = bookings && bookings.length ? bookings[0].payoutDate || "2025-08-01" : "2025-08-01";

  return (
    <div className="card" aria-label="Total Earnings" role="region">
      <h3>Total Earnings</h3>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="#F1C40F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12h16" stroke="#F1C40F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 20h12" stroke="#F1C40F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <div>
          <div className="value" aria-label={`Total earnings: R${total.toLocaleString()}`}>R{total.toLocaleString()}</div>
          <div className="muted">Last payout: {lastPayout}</div>
        </div>
      </div>
      <div style={{marginTop:12}}>
  <button className="btn primary btn--beam" aria-label="Request payout">Request payout</button>
      </div>
    </div>
  );
}
