import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // DB Seed progress states
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);
  const [seedMessage, setSeedMessage] = useState('');
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    setSeedSuccess(false);
    setSeedProgress(15);
    setSeedMessage('Inspecting and preparing User DB...');

    const interval = setInterval(() => {
      setSeedProgress((prev) => {
        if (prev < 40) return prev + 15;
        if (prev < 80) return prev + 10;
        return prev;
      });
    }, 250);

    try {
      const res = await api.seedDemoDatabase();
      clearInterval(interval);
      setSeedProgress(100);
      setSeedMessage('✅ Seed Completed! (4 Users & Ledger Created)');
      setSeedSuccess(true);
      setTimeout(() => {
        setSeedLoading(false);
      }, 4000);
    } catch (err) {
      clearInterval(interval);
      setSeedMessage(`❌ ${err.message || 'Seeding failed'}`);
      setSeedLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 242, 254, 0.4)',
            marginBottom: '12px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#090d16">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Apex Trust Bank</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Next-Gen Digital Banking & Asset Treasury
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fb7185',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '18px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Email Address</label>
            <input
              id="login-email-input"
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              id="login-password-input"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Instant Demo Logins (Click to autofill)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              id="demo-admin-btn"
              onClick={() => setDemoCredentials('admin@apexbank.com')}
              className="btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 12px' }}
            >
              <span>👑 Administrator</span>
              <span style={{ color: 'var(--accent-amber)', fontSize: '0.75rem' }}>admin@apexbank.com</span>
            </button>

            <button
              type="button"
              id="demo-alice-btn"
              onClick={() => setDemoCredentials('alice@example.com')}
              className="btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 12px' }}
            >
              <span>👩 Alice Johnson</span>
              <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>alice@example.com</span>
            </button>

            <button
              type="button"
              id="demo-bob-btn"
              onClick={() => setDemoCredentials('bob@example.com')}
              className="btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 12px' }}
            >
              <span>👨 Bob Martinez</span>
              <span style={{ color: '#34d399', fontSize: '0.75rem' }}>bob@example.com</span>
            </button>
          </div>

          {/* Seed User DB Button & Progress Bar */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-subtle)' }}>
            <button
              type="button"
              id="seed-user-db-btn"
              onClick={handleSeedDatabase}
              disabled={seedLoading}
              className="btn-secondary"
              style={{
                width: '100%',
                fontSize: '0.8rem',
                padding: '9px 12px',
                justifyContent: 'center',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                background: 'rgba(16, 185, 129, 0.08)',
                color: '#34d399',
                fontWeight: 600,
              }}
            >
              {seedLoading ? '🌱 Seeding User Database in Progress...' : '🌱 Seed / Reset User Database'}
            </button>

            {seedProgress > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: seedSuccess ? '#34d399' : 'var(--text-muted)' }}>{seedMessage}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{seedProgress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${seedProgress}%`,
                    height: '100%',
                    background: seedSuccess ? '#10b981' : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Switch to Register */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Need a new account?{' '}
          <button
            id="switch-to-register-btn"
            type="button"
            onClick={onSwitchToRegister}
            style={{
              background: 'transparent',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
