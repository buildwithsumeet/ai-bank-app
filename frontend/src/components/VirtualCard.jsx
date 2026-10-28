import React, { useState } from 'react';

export default function VirtualCard({ account, userName }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!account) return null;

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="virtual-card">
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
              APEX
            </span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--accent-cyan)' }}>
              {account.accountType.toUpperCase()}
            </span>
          </div>

          {/* Contactless waves SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
            <path d="M8.5 16.5a5 5 0 0 1 0-7"/>
            <path d="M12 19a9 9 0 0 0 0-14"/>
            <path d="M15.5 21.5a13 13 0 0 0 0-19"/>
          </svg>
        </div>

        {/* Chip & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 8px' }}>
          <div className="chip"></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-indicator"></span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              {account.status}
            </span>
          </div>
        </div>

        {/* 16-Digit Card Number */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.25rem',
            letterSpacing: '0.12em',
            color: '#f8fafc',
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}>
            {showDetails
              ? account.cardNumber || '4532 8920 1823 9921'
              : `•••• •••• •••• ${account.accountNumber ? account.accountNumber.slice(-4) : '9921'}`}
          </div>
        </div>

        {/* Card Footer: Holder, Expiry, CVV */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.08em' }}>
              Cardholder
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.04em' }}>
              {userName || 'VALUED CLIENT'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b' }}>
                Expires
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#e2e8f0' }}>
                {account.cardExpiry || '12/28'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b' }}>
                CVV
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#e2e8f0' }}>
                {showDetails ? account.cardCvv || '884' : '•••'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls & Quick Copy Bar */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          id="toggle-card-details-btn"
          onClick={() => setShowDetails(!showDetails)}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 12px', flex: 1 }}
        >
          {showDetails ? '🙈 Hide Details' : '👁️ Reveal Card'}
        </button>

        <button
          id="copy-account-number-btn"
          onClick={copyAccountNumber}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 12px', flex: 1 }}
        >
          {copied ? '✅ Copied!' : `📋 Acct: ${account.accountNumber}`}
        </button>
      </div>
    </div>
  );
}
