import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, usersRes, txRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getAdminTransactions({ limit: 20 }),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (txRes.success) setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleStatus = async (accountId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'frozen' : 'active';
    try {
      const res = await api.updateAccountStatus(accountId, nextStatus);
      if (res.success) {
        setActionMessage(`Account status updated to ${nextStatus}`);
        setTimeout(() => setActionMessage(''), 3000);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update account status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Bank Administration & Compliance</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time oversight of financial liquidity, client accounts, and systemic ledger.
        </p>
      </div>

      {actionMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          ✓ {actionMessage}
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL SYSTEM HOLDINGS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '6px' }}>
              ${metrics.totalBankHoldings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Across all customer vaults</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TRANSACTION VOLUME</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>
              ${metrics.totalTransactionVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Processed volume</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>REGISTERED CLIENTS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
              {metrics.totalUsers}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Active retail & business clients</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACTIVE ACCOUNTS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-indigo)', marginTop: '6px' }}>
              {metrics.activeAccounts} / {metrics.totalAccounts}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Operational accounts</div>
          </div>
        </div>
      )}

      {/* Users & Accounts Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
          Client Accounts & Liquidity
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Client</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Accounts & Numbers</th>
                <th style={{ padding: '12px 16px' }}>Total Balance</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((client) => (
                <tr key={client._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{client.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{client.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${client.role === 'admin' ? 'badge-admin' : 'badge-deposit'}`}>
                      {client.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {client.accounts?.map((acc) => (
                      <div key={acc._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                          {acc.accountNumber}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ({acc.accountType} - ${acc.balance.toFixed(2)})
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: acc.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: acc.status === 'active' ? '#34d399' : '#fb7185',
                        }}>
                          {acc.status}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    ${(client.totalBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {client.accounts?.map((acc) => (
                      <button
                        key={acc._id}
                        onClick={() => handleToggleStatus(acc._id, acc.status)}
                        className="btn-secondary"
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          marginRight: '6px',
                          marginBottom: '4px',
                        }}
                      >
                        {acc.status === 'active' ? '🔒 Freeze' : '🔓 Unfreeze'}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Transaction Ledger */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
          Global Transaction Audit Ledger
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Ref ID</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Amount</th>
                <th style={{ padding: '12px 16px' }}>Details</th>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {tx.referenceId}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${
                      tx.type === 'DEPOSIT'
                        ? 'badge-deposit'
                        : tx.type === 'WITHDRAWAL'
                        ? 'badge-withdrawal'
                        : 'badge-transfer'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {tx.description}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-deposit">{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
