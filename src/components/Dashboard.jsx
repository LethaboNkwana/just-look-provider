// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ScreenForm from './ScreenForm';
import ScreenList from './ScreenList';
import Earnings from './Earnings';
import Nav from './Nav';
import Profile from './Profile';
import Analytics from './Analytics';
import Settings from './Settings';
import Bookings from './Bookings';

export default function Dashboard({ user }) {
  const [screens, setScreens] = useState([]);
  const [bookings, setBookings] = useState([]);
  // showForm removed; use dedicated route 'add-screen'
  const [route, setRoute] = useState('home');

  useEffect(() => {
    loadScreens();
    loadBookings();
  }, []);

  const loadScreens = async () => {
    const q = query(collection(db, 'screens'), where('providerId', '==', user.uid));
    const snap = await getDocs(q);
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setScreens(list);
  };

  const loadBookings = async () => {
    const screenIds = screens.map(s => s.id);
    if (screenIds.length === 0) return;
    const q = query(collection(db, 'bookings'), where('screenId', 'in', screenIds));
    const snap = await getDocs(q);
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();
  }, [screens]);

  return (
    <div className="dashboard">
      <div className="sky-layer"></div>
      <div className="clouds"></div>

      <header role="banner" className="dashboard-header">
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <button className="btn-logout" onClick={() => auth.signOut()} aria-label="Logout">Logout</button>
          <div className="logo">JustLoook</div>
        </div>
      </header>

      <div style={{display:'flex', gap:24, maxWidth:1200, margin:'0 auto', padding:'16px'}}>
        <Nav active={route} onNavigate={setRoute} user={user} />

        <main style={{flex:1}} role="main" aria-label="Dashboard content">
          {route === 'home' && (
            <div className="dashboard-grid">
              <div className="card dashboard-welcome" aria-label="Welcome">
                <h2>Welcome to JustLoook</h2>
                <p>Manage your digital screens, track bookings, and grow your DOOH business.</p>
              </div>

              <Earnings bookings={bookings} />

              <div className="card dashboard-screens" aria-label="Your Screens">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3>Your Screens <span style={{fontWeight:400, fontSize:'1rem'}}>({screens.length})</span></h3>
                  <button 
                    onClick={() => setRoute('add-screen')} 
                    className="btn primary" 
                    aria-label="Add New Screen"
                    style={{maxWidth:'180px'}}
                  >+ Add New Screen</button>
                </div>

                <ScreenList screens={screens} />
              </div>

              <div className="card dashboard-bookings" aria-label="Recent bookings">
                <h3>Recent bookings</h3>
                {bookings.length === 0 ? (
                  <p className="muted">No bookings yet.</p>
                ) : (
                  <ul className="booking-list">
                    {bookings.slice(0, 5).map(booking => (
                      <li key={booking.id} className="booking-item">
                        <strong>{booking.advertiserName}</strong>
                        <div className="muted">{booking.date} • {booking.timeSlots?.length || 0} slots</div>
                        <div className="status booked">Booked</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {route === 'screens' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h2>Your Screens ({screens.length})</h2>
                <button onClick={() => setRoute('add-screen')} className="btn primary">+ Add New Screen</button>
              </div>
              <ScreenList screens={screens} />
            </div>
          )}

          {route === 'add-screen' && (
            <div className="card" aria-label="Add Screen">
              <h2>Add New Screen</h2>
              <ScreenForm onSuccess={() => {
                // after successful save, reload screens and go to screens list
                loadScreens();
                setRoute('screens');
              }} onCancel={() => setRoute('screens')} />
            </div>
          )}

          {route === 'analytics' && (
            <Analytics screens={screens} bookings={bookings} />
          )}

          {route === 'profile' && (
            <Profile user={user} />
          )}

          {route === 'settings' && (
            <Settings user={user} />
          )}

          {route === 'bookings' && (
            <Bookings bookings={bookings} screens={screens} />
          )}
        </main>
      </div>
    </div>
  );
}
