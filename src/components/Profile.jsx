import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile({ user }) {
  const [profile, setProfile] = useState({ name: user?.displayName || '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const ref = doc(db, 'providers', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(prev => ({ ...prev, ...(snap.data() || {}) }));
      } catch (err) {
        console.error('Could not load profile', err);
        setError('Could not load profile: ' + (err.message || err.code || 'Unknown error'));
      }
    };
    load();
  }, [user]);

  const save = async () => {
    setError('');
    setMessage('');
    // allow using passed `user` or fall back to the firebase auth currentUser
    const current = user || auth.currentUser;
    if (!current) {
      setError('You must be signed in to save your profile.');
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'providers', current.uid), { ...profile, email: current.email }, { merge: true });
      setMessage('Profile saved.');
    } catch (err) {
      console.error('Save profile failed', err);
      const msg = err?.code === 'permission-denied' || (err?.message && err.message.toLowerCase().includes('missing or insufficient'))
        ? 'Permission denied when saving profile. Check your Firestore rules and that the authenticated user can write to /providers/{uid}. (' + (err.code || err.message) + ')'
        : 'Could not save profile: ' + (err.message || err.code || 'Unknown error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" aria-label="Profile">
      <h3>Profile</h3>
      <p className="muted">Manage your account details</p>
  {error && <p className="error" role="alert">{error}</p>}
  {message && <p className="message">{message}</p>}
      <div style={{marginTop:12}}>
        <label className="field">
          <span className="label">Company name</span>
          <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} disabled={loading} />
        </label>
        <div style={{marginTop:8}}><strong>Email:</strong> {user?.email}</div>
        <div style={{marginTop:8}}><strong>UID:</strong> {user?.uid}</div>
        <div style={{marginTop:12}} className="form-actions">
          <button className="btn cancel" onClick={() => setProfile({ name: user?.displayName || '' })} disabled={loading}>Reset</button>
          <button className="btn primary" onClick={save} disabled={loading}>Save</button>
        </div>
      </div>
    </div>
  );
}
