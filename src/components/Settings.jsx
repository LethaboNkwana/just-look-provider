import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Settings({ user }) {
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const ref = doc(db, 'providers', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setNotify(Boolean(data?.notify));
      }
    };
    load();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'providers', user.uid), { notify }, { merge: true });
    } catch (err) {
      console.error('Could not save settings', err);
      // show a small alert so users know something went wrong
      alert('Could not save settings: ' + (err.message || err.code || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" aria-label="Settings">
      <h3>Settings</h3>
      <label style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
        <input type="checkbox" checked={notify} onChange={() => setNotify(!notify)} disabled={loading} />
        <div>
          <div><strong>Email notifications</strong></div>
          <div className="muted small">Receive booking updates and reports</div>
        </div>
      </label>
      <div style={{marginTop:12}} className="form-actions">
        <button className="btn primary" onClick={save} disabled={loading}>Save settings</button>
      </div>
    </div>
  );
}
