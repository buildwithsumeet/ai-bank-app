import React, { useState } from 'react';
import { api } from '../api/client';

export default function DepositWithdrawModal({ isOpen, onClose, mode, account, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isDeposit = mode === 'DEPOSIT';
  const numAmount = Number(amount) || 0;
  const projectedBalance = isDeposit
    ? (account?.balance || 0) + numAmount
    : (account?.balance || 0) - numAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (numAmount <= 0) {
      setError(`Please enter a valid amount to ${isDeposit ? 'deposit' : 'withdraw'}`);
      return;
    }

    if (!isDeposit && numAmount > account.balance) {
      setError(`Insufficient balance. Current balance is $${account.balance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isDeposit) {
        res = await api.deposit(
          account._id,
          numAmount,
          description || 'Direct Cash Deposit',
          'Cash Deposit'
        );
      } else {
        res = await api.withdraw(
          account._id,
          numAmount,
          description || 'ATM Cash Withdrawal',
          'ATM Withdrawal'
        );
      }

      if (res.success) {
        onSuccess(res.message);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const quickPresets = isDeposit ? [50, 100, 250, 500, 1000] : [20, 50, 100, 200, 500];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              {isDeposit ? 'Deposit Funds' : 'Withdraw Cash'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Target: {account?.accountType.toUpperCase()} (•••• {account?.accountNumber.slice(-4)})
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
          {/* Amount */}
          <div>
            <label className="input-label">Amount ($ USD)</label>
            <input
              id="amount-input"
              type="number"
              step="0.01"
              min="0.01"
              max={!isDeposit ? account?.balance : undefined}
              className="input-field"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            {/* Quick chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {quickPresets.map((amt) => (
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
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="input-label">Description / Memo</label>
            <input
              id="memo-input"
              type="text"
              className="input-field"
              placeholder={isDeposit ? 'e.g. Check deposit, cash addition' : 'e.g. ATM withdrawal, grocery cash'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Balance projection */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Balance</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>${account?.balance.toFixed(2)}</div>
            </div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>➔</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Balance</div>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: projectedBalance < 0 ? '#fb7185' : 'var(--accent-cyan)',
              }}>
                ${projectedBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Buttons */}
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
              id="confirm-action-btn"
              type="submit"
              className={isDeposit ? 'btn-emerald' : 'btn-rose'}
              disabled={loading || (!isDeposit && projectedBalance < 0)}
              style={{ flex: 2, padding: '12px' }}
            >
              {loading
                ? 'Processing...'
                : `${isDeposit ? 'Deposit' : 'Withdraw'} $${numAmount.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
