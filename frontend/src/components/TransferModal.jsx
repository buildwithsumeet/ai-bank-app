import React, { useState } from 'react';
import { api } from '../api/client';

export default function TransferModal({ isOpen, onClose, senderAccount, onSuccess }) {
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Verify recipient account number
  const handleLookup = async () => {
    if (!toAccountNumber.trim() || toAccountNumber.trim().length < 8) {
      setLookupError('Please enter a valid 10-digit account number');
      setRecipientName('');
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await api.lookupAccount(toAccountNumber.trim());
      if (res.success) {
        setRecipientName(res.data.recipientName);
      }
    } catch (err) {
      setLookupError(err.message || 'Account not found');
      setRecipientName('');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid transfer amount');
      return;
    }

    if (numAmount > senderAccount.balance) {
      setError(`Insufficient balance. Maximum available is $${senderAccount.balance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.transfer(
        senderAccount._id,
        toAccountNumber.trim(),
        numAmount,
        description || 'Peer-to-peer Bank Transfer',
        category
      );

      if (res.success) {
        onSuccess(res.message);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [25, 50, 100, 250, 500];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Send Money</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              From: {senderAccount?.accountType.toUpperCase()} (•••• {senderAccount?.accountNumber.slice(-4)}) - Available: ${senderAccount?.balance.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '1.5rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fb7185',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Recipient Account Number */}
          <div>
            <label className="input-label">Recipient Account Number</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="transfer-recipient-input"
                type="text"
                className="input-field"
                placeholder="e.g. 1077391823"
                value={toAccountNumber}
                onChange={(e) => {
                  setToAccountNumber(e.target.value);
                  setRecipientName('');
                  setLookupError('');
                }}
                required
              />
              <button
                type="button"
                id="transfer-verify-account-btn"
                className="btn-secondary"
                onClick={handleLookup}
                disabled={lookupLoading}
                style={{ whiteSpace: 'nowrap', padding: '0 16px', fontSize: '0.85rem' }}
              >
                {lookupLoading ? 'Checking...' : 'Verify'}
              </button>
            </div>

            {recipientName && (
              <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                ✓ Recipient: {recipientName}
              </div>
            )}
            {lookupError && (
              <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#fb7185' }}>
                ✕ {lookupError}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="input-label">Amount ($ USD)</label>
            <input
              id="transfer-amount-input"
              type="number"
              step="0.01"
              min="0.01"
              max={senderAccount?.balance}
              className="input-field"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            {/* Quick chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-secondary)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  +${amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(senderAccount?.balance.toString())}
                style={{
                  background: 'rgba(0,242,254,0.1)',
                  color: 'var(--accent-cyan)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  border: '1px solid rgba(0,242,254,0.2)',
                  fontWeight: 600,
                }}
              >
                Max (${senderAccount?.balance.toFixed(2)})
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="input-label">Category</label>
            <select
              id="transfer-category-select"
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Transfer" style={{ background: '#111827' }}>Transfer</option>
              <option value="Shopping" style={{ background: '#111827' }}>Shopping / Purchase</option>
              <option value="Utilities" style={{ background: '#111827' }}>Rent / Utilities</option>
              <option value="Salary" style={{ background: '#111827' }}>Salary / Freelance</option>
              <option value="Investment" style={{ background: '#111827' }}>Investment</option>
              <option value="Other" style={{ background: '#111827' }}>Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="input-label">Note / Description (Optional)</label>
            <input
              id="transfer-description-input"
              type="text"
              className="input-field"
              placeholder="e.g. Dinner split, Rent share"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              id="confirm-transfer-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? 'Processing Transfer...' : `Transfer $${Number(amount || 0).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
