// src/components/ScreenForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ScreenForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    size: '6x3m',
    type: 'Digital LED',
    tier: 'B',
    playsPerHour: 120,
    hourlyRates: { prime: 850, shoulder: 500, late: 350, overnight: 200 },
    availability: '00:00-24:00',
    image: null
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const addressInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    // basic validation
    setError('');
    setMessage('');
    if (!form.name || !form.address) {
      setError('Please provide a screen name and address.');
      setUploading(false);
      return;
    }

    // ensure user is signed in
    const user = auth.currentUser;
    if (!user) {
      setError('You must be signed in to add a screen.');
      setUploading(false);
      return;
    }

    let imageUrl = '';
    // upload image separately so we can detect storage permission issues
    if (form.image) {
      try {
        const imageRef = ref(storage, `/screens/${Date.now()}_${form.image.name}`);
        const snapshot = await uploadBytes(imageRef, form.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (storageErr) {
        console.error('Storage upload failed', storageErr);
        setError('Image upload failed: ' + (storageErr.message || storageErr.code) + '. Check Firebase Storage rules and that you are authenticated.');
        setUploading(false);
        return;
      }
    }

    // build payload explicitly to avoid including the File object
    const payload = {
      name: form.name,
      address: form.address,
      lat: form.lat,
      lng: form.lng,
      size: form.size,
      type: form.type,
      tier: form.tier,
      playsPerHour: Number(form.playsPerHour) || 0,
      hourlyRates: {
        prime: Number(form.hourlyRates.prime) || 0,
        shoulder: Number(form.hourlyRates.shoulder) || 0,
        late: Number(form.hourlyRates.late) || 0,
        overnight: Number(form.hourlyRates.overnight) || 0
      },
      availability: form.availability,
      imageUrl,
      providerId: user.uid,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, 'screens'), payload);
      setMessage('Screen saved.');
      // clear form (keep tier/type defaults)
      setForm({
        name: '',
        address: '',
        lat: '',
        lng: '',
        size: '6x3m',
        type: 'Digital LED',
        tier: 'B',
        playsPerHour: 120,
        hourlyRates: { prime: 850, shoulder: 500, late: 350, overnight: 200 },
        availability: '00:00-24:00',
        image: null
      });
      // revoke preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      // notify parent (which navigates away and reloads list)
      onSuccess();
    } catch (err) {
      console.error('Could not save screen', err);
      const msg = err?.code === 'permission-denied' || (err?.message && err.message.toLowerCase().includes('missing or insufficient'))
        ? 'Permission denied when saving screen. Check your Firestore rules and that the authenticated user is allowed to write to /screens.'
        : (err.message || 'Could not save screen.');
      setError(msg);
      setUploading(false);
      return;
    } finally {
      setUploading(false);
    }
  };

  // Load Google Maps Places Autocomplete and initialize map preview
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // no key configured - do nothing but allow manual lat/lng entry
      return;
    }

    const existing = document.querySelector('script[data-google-maps]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      s.async = true;
      s.defer = true;
      s.setAttribute('data-google-maps', '1');
      document.head.appendChild(s);
      s.onload = () => initAutocomplete();
    } else if (window.google && window.google.maps) {
      initAutocomplete();
    } else {
      existing.addEventListener('load', initAutocomplete);
    }

    function initAutocomplete() {
      try {
        if (!addressInputRef.current) return;
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, { types: ['geocode', 'establishment'] });
        autocomplete.setFields(['geometry', 'formatted_address', 'name']);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place || !place.geometry) return;
          const formatted = place.formatted_address || place.name || '';
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setForm(f => ({ ...f, address: formatted, lat: lat, lng: lng }));
          // init map if container available
          if (mapContainerRef.current) {
            if (!mapRef.current) {
              mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
                center: { lat, lng },
                zoom: 15,
              });
            } else {
              mapRef.current.setCenter({ lat, lng });
            }
            if (!markerRef.current) {
              markerRef.current = new window.google.maps.Marker({ position: { lat, lng }, map: mapRef.current });
            } else {
              markerRef.current.setPosition({ lat, lng });
            }
          }
        });
      } catch (err) {
        // silently fail - user can still type address and lat/lng
        console.warn('Could not init Google Places autocomplete', err);
      }
    }

    return () => {
      // no-op cleanup; markers/maps are GC'd by removing references
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="form" aria-label="Add New Screen">
      <h3>Add New Screen</h3>
      <label className="field">
        <span className="label">Screen name</span>
        <input
          id="screen-name"
          name="screenName"
          placeholder="Screen name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          required
          aria-label="Screen name"
          disabled={uploading}
        />
      </label>
      <input
        ref={addressInputRef}
        placeholder="Address"
        value={form.address}
        onChange={e => setForm({...form, address: e.target.value})}
        aria-label="Address"
        aria-autocomplete="both"
        autoComplete="off"
        disabled={uploading}
      />
      {/* Map preview (initialized when Google Maps API key is present) */}
      <div style={{marginTop:12}}>
        <div ref={mapContainerRef} style={{width: '100%', height: 200, borderRadius: 8, overflow: 'hidden', background: '#eef6ff'}} aria-hidden={!mapContainerRef.current} />
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <div className="muted small" style={{marginTop:8}}>Tip: set VITE_GOOGLE_MAPS_API_KEY in your <code>.env</code> to enable address autocomplete and a map preview.</div>
        )}
      </div>
      <div className="grid-2">
        <input
          placeholder="Latitude"
          type="number"
          step="0.0001"
          value={form.lat}
          onChange={e => setForm({...form, lat: e.target.value})}
        />
        <input
          placeholder="Longitude"
          type="number"
          step="0.0001"
          value={form.lng}
          onChange={e => setForm({...form, lng: e.target.value})}
        />
      </div>
      <select
        value={form.tier}
        onChange={e => setForm({...form, tier: e.target.value})}
      >
        <option value="A">Tier A - Premium</option>
        <option value="B">Tier B - Standard</option>
        <option value="C">Tier C - Value</option>
      </select>
      <div className="grid-2">
        <input
          placeholder="Prime Rate (R/hr)"
          type="number"
          value={form.hourlyRates.prime}
          onChange={e => setForm({
            ...form,
            hourlyRates: {...form.hourlyRates, prime: e.target.value}
          })}
          required
        />
        <input
          placeholder="Shoulder Rate (R/hr)"
          type="number"
          value={form.hourlyRates.shoulder}
          onChange={e => setForm({
            ...form,
            hourlyRates: {...form.hourlyRates, shoulder: e.target.value}
          })}
        />
      </div>
      <label className="file-upload" htmlFor="screen-image">
        Upload image
        <input
          id="screen-image"
          type="file"
          accept="image/*"
          onChange={e => {
            const f = e.target.files[0];
            setForm({...form, image: f});
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
            if (f) setPreviewUrl(URL.createObjectURL(f));
          }}
        />
      </label>
      {previewUrl && (
        <div style={{marginTop:8}}>
          <img src={previewUrl} alt="preview" style={{width: '100%', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.3)'}}/>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {message && <p className="message" role="status">{message}</p>}
      <div className="form-actions">
        <button type="button" onClick={() => { if (onCancel) onCancel(); else if (onSuccess) onSuccess(); }} className="btn cancel">Cancel</button>
        <button type="submit" disabled={uploading} className="btn primary btn--beam">
          {uploading ? 'Uploading...' : 'Save Screen'}
        </button>
      </div>
    </form>
  );
}
