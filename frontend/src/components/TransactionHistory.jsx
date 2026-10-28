import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function TransactionHistory({ activeAccount, refreshTrigger }) {
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (searchTerm) params.search = searchTerm;
      if (activeAccount) params.accountId = activeAccount._id;

      const res = await api.getTransactions(params);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, activeAccount, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const isPositive = (tx) => {
    if (tx.type === 'DEPOSIT') return true;
    if (tx.type === 'TRANSFER' && tx.recipientAccount === activeAccount?._id) return true;
    return false;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Top Header & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Activity & Ledger</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time audit log of all financial movements
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'All', value: '' },
            { label: 'Deposits', value: 'DEPOSIT' },
            { label: 'Transfers', value: 'TRANSFER' },
            { label: 'Withdrawals', value: 'WITHDRAWAL' },
          ].map((pill) => (
            <button
              key={pill.label}
              onClick={() => setTypeFilter(pill.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: typeFilter === pill.value ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: typeFilter === pill.value ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: `1px solid ${typeFilter === pill.value ? 'rgba(0, 242, 254, 0.4)' : 'var(--border-subtle)'}`,
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          id="search-transactions-input"
          type="text"
          className="input-field"
          placeholder="Search by reference, memo, or account number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px 14px', fontSize: '0.85rem' }}
        />
        <button type="submit" className="btn-secondary" style={{ padding: '0 16px', fontSize: '0.85rem' }}>
          Search
        </button>
      </form>

      {/* Transaction List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-subtle)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💳</div>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No transactions found</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Deposit funds or send a transfer to start your ledger history
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.map((tx) => {
            const positive = isPositive(tx);

            return (
              <div
                key={tx._id}
                onClick={() => setSelectedTx(tx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Left: Icon & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: positive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}>
                    {tx.type === 'DEPOSIT' ? '↓' : tx.type === 'WITHDRAWAL' ? '↑' : '⇄'}
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                      {tx.description || tx.type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span className={`badge ${
                        tx.type === 'DEPOSIT'
                          ? 'badge-deposit'
                          : tx.type === 'WITHDRAWAL'
                          ? 'badge-withdrawal'
                          : 'badge-transfer'
                      }`}>
                        {tx.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Reference */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: positive ? '#34d399' : '#fb7185',
                  }}>
                    {positive ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '2px',
                  }}>
                    {tx.referenceId}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Details Modal / Receipt */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(0, 242, 254, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                fontSize: '1.8rem',
                marginBottom: '10px',
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Transaction Receipt</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reference: {selectedTx.referenceId}</p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type</span>
                <span style={{ fontWeight: 600 }}>{selectedTx.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  ${selectedTx.amount.toFixed(2)} {selectedTx.currency}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category</span>
                <span>{selectedTx.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time</span>
                <span>{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className="badge badge-deposit">{selectedTx.status}</span>
              </div>
              {selectedTx.description && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Description</div>
                  <div style={{ fontSize: '0.85rem' }}>{selectedTx.description}</div>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => setSelectedTx(null)}
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
