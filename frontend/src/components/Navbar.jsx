import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, setCurrentView, onOpenNewAccount }) {
  const { user, accounts, activeAccount, setActiveAccount, logout } = useAuth();

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 12, 21, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0, 242, 254, 0.3)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#090d16">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/>
            </svg>
          </div>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}>
              APEX BANK
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              DIGITAL ASSET VAULT
            </span>
          </div>
        </div>

        {/* Center / Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user?.role === 'admin' && (
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <button
                id="nav-customer-view-btn"
                onClick={() => setCurrentView('customer')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: currentView === 'customer' ? 'var(--accent-cyan)' : 'transparent',
                  color: currentView === 'customer' ? '#030712' : 'var(--text-secondary)',
                }}
              >
                My Account
              </button>
              <button
                id="nav-admin-view-btn"
                onClick={() => setCurrentView('admin')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: currentView === 'admin' ? 'var(--accent-cyan)' : 'transparent',
                  color: currentView === 'admin' ? '#030712' : 'var(--text-secondary)',
                }}
              >
                Admin Console
              </button>
            </div>
          )}

          {/* Account Selector if multiple accounts */}
          {accounts.length > 0 && currentView === 'customer' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                id="account-selector"
                value={activeAccount?._id || ''}
                onChange={(e) => {
                  const selected = accounts.find((a) => a._id === e.target.value);
                  if (selected) setActiveAccount(selected);
                }}
                className="input-field"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  maxWidth: '240px',
                  cursor: 'pointer',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                }}
              >
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id} style={{ background: '#111827', color: '#f8fafc' }}>
                    {acc.accountType.toUpperCase()} (•••• {acc.accountNumber.slice(-4)}) - ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>

              <button
                id="open-account-btn"
                onClick={onOpenNewAccount}
                title="Open another account (e.g., Savings, Checking)"
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                + Add
              </button>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
              <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-deposit'}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <button
            id="logout-btn"
            onClick={logout}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#fb7185' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
