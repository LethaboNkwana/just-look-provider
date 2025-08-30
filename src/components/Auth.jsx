// src/components/Auth.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        if (remember) localStorage.setItem('rememberEmail', email);
        else localStorage.removeItem('rememberEmail');
      } else {
        if (password.length < 6) throw { code: 'auth/weak-password' };
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // set display name
        try { await updateProfile(cred.user, { displayName: name || '' }); } catch(e){}
        // create basic provider document
        try {
          await setDoc(doc(db, 'providers', cred.user.uid), {
            name: name || '',
            email,
            createdAt: new Date().toISOString()
          });
        } catch (e) {
          // non-fatal
          console.warn('Could not create provider doc', e);
        }
        // persist remembered email on signup as well
        if (remember) localStorage.setItem('rememberEmail', email);
        else localStorage.removeItem('rememberEmail');
        setMessage('Account created — you are now signed in.');
      }
    } catch (err) {
      // friendlier messages
      const code = err?.code || '';
      if (code === 'auth/wrong-password') setError('Incorrect password.');
      else if (code === 'auth/user-not-found') setError('No account found for this email.');
      else if (code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else setError(err.message || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email) {
      setError('Enter your email to reset password.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
  setMessage('Password reset email sent. Check your inbox (and spam folder).');
    } catch (err) {
  const code = err?.code || '';
  if (code === 'auth/user-not-found') setError('No account found for this email.');
  else setError(err.message || 'Could not send reset email.');
    }
    setLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('rememberEmail');
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  return (
    <div className="auth-container" role="main" aria-label="Authentication">
      <div className="sky-layer"></div>
      <div className="clouds"></div>
      <div className="card" aria-live="polite">
  <h1 className="logo">JustLoook</h1>
        <p className="muted">Provider Portal</p>
  {error && <p className="error" role="alert">{error}</p>}
  {message && <p className="message" role="status">{message}</p>}

        <form onSubmit={handleSubmit} aria-label={isLogin ? 'Login form' : 'Sign up form'}>
          {!isLogin && (
            <label className="field">
              <span className="label">Company name</span>
              <input
                id="company"
                name="company"
                placeholder="Company name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                aria-label="Company name"
                disabled={loading}
              />
            </label>
          )}

          <label className="field">
            <span className="label">Email</span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              aria-label="Email address"
              autoComplete="email"
              disabled={loading}
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter a secure password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              aria-label="Password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={loading}
            />
          </label>

          <div className="form-meta" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <label htmlFor="remember" style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <input id="remember" name="remember" type="checkbox" aria-label="Remember me" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span className="muted">Remember me</span>
            </label>
            <button type="button" className="link muted" onClick={handleReset} disabled={loading} aria-label="Reset password">Forgot password?</button>
          </div>

          <button
            type="submit"
            className="btn primary btn--beam"
            aria-label={isLogin ? 'Login' : 'Sign Up'}
            disabled={loading}
          >
            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>

          <div className="form-actions">
            <button
              type="button"
              className="btn cancel"
              onClick={() => setIsLogin(!isLogin)}
              aria-label={isLogin ? 'Switch to Sign Up' : 'Back to Login'}
              disabled={loading}
            >
              {isLogin ? 'Create Account' : 'Back to Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
