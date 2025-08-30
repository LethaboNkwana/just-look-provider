// src/components/ScreenList.jsx
import React from 'react';

export default function ScreenList({ screens }) {
  if (screens.length === 0) {
  return <p className="empty muted" role="status">You haven't added any screens yet.</p>;
  }

  return (
    <ul className="screen-list" aria-label="Screen List">
      {screens.map(screen => (
        <li key={screen.id} className="screen-item" tabIndex={0} aria-label={`Screen: ${screen.name}, Tier ${screen.tier}`}>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            {screen.imageUrl ? (
              <img src={screen.imageUrl} alt={screen.name} style={{width:72,height:48,objectFit:'cover',borderRadius:6,boxShadow:'0 8px 20px rgba(0,0,0,0.3)'}} />
            ) : (
              <div style={{width:72,height:48,background:'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="18" rx="2" fill="#ffffff" fill-opacity="0.06"/></svg>
              </div>
            )}
            <div style={{flex:1}}>
              <div className="screen-header">
                <h4 style={{margin:0}}>{screen.name}</h4>
                <span className={`tier tier-${screen.tier.toLowerCase()}`}>Tier {screen.tier}</span>
              </div>
              <p className="address">{screen.address}</p>
              <div className="rates"><strong>Prime:</strong> R{screen.hourlyRates?.prime}/hr</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
