import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VirtualCard from '../components/VirtualCard';
import TransferModal from '../components/TransferModal';
import DepositWithdrawModal from '../components/DepositWithdrawModal';
import TransactionHistory from '../components/TransactionHistory';
import AnalyticsChart from '../components/AnalyticsChart';
import AiAdvisorModal from '../components/AiAdvisorModal';
import { api } from '../api/client';

export default function Dashboard({ isNewAccountOpen, setIsNewAccountOpen, onOpenChatbot }) {
  const { user, accounts, activeAccount, refreshAccounts } = useAuth();

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // For opening secondary account
  const [newAccType, setNewAccType] = useState('savings');
  const [newAccLoading, setNewAccLoading] = useState(false);

  const [notification, setNotification] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showNotification = (msg) => {
    setNotification(msg);
    refreshAccounts();
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleCreateNewAccount = async (e) => {
    e.preventDefault();
    setNewAccLoading(true);
    try {
      const res = await api.createAccount(newAccType);
      if (res.success) {
        showNotification(res.message);
        setIsNewAccountOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to open account');
    } finally {
      setNewAccLoading(false);
    }
  };

  const totalVaultBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 2000,
          background: 'rgba(16, 185, 129, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideUp 0.3s ease',
        }}>
          <span>✓</span> {notification}
        </div>
      )}

      {/* Hero Balance & Quick Actions Header */}
      <div className="glass-panel" style={{
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {activeAccount?.accountType.toUpperCase()} BALANCE (•••• {activeAccount?.accountNumber.slice(-4)})
          </div>
          <div style={{
            fontSize: '2.8rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            margin: '8px 0 4px',
            fontFamily: 'var(--font-mono)',
          }}>
            ${(activeAccount?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Combined Liquidity across {accounts.length} accounts:{' '}
            <strong style={{ color: 'var(--accent-cyan)' }}>
              ${totalVaultBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            id="action-send-money-btn"
            onClick={() => setTransferModalOpen(true)}
            className="btn-primary"
            style={{ padding: '12px 22px' }}
          >
            <span style={{ fontSize: '1.1rem' }}>💸</span> Transfer Funds
          </button>

          <button
            id="action-deposit-btn"
            onClick={() => setDepositModalOpen(true)}
            className="btn-emerald"
            style={{ padding: '12px 20px' }}
          >
            <span style={{ fontSize: '1.1rem' }}>↓</span> Deposit
          </button>

          <button
            id="action-withdraw-btn"
            onClick={() => setWithdrawModalOpen(true)}
            className="btn-rose"
            style={{ padding: '12px 20px' }}
          >
            <span style={{ fontSize: '1.1rem' }}>↑</span> Withdraw
          </button>

          <button
            id="action-ai-advisor-btn"
            onClick={onOpenChatbot}
            className="btn-secondary"
            style={{
              padding: '12px 20px',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              background: 'rgba(0, 242, 254, 0.08)',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🤖</span> Chat Banking AI
          </button>

        </div>
      </div>


      {/* Grid Layout: Left Cards/Analytics + Right Activity Ledger */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Left Column: Virtual Debit Card & Financial Pulse */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Digital Debit Card</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap details to toggle</span>
            </div>
            <VirtualCard account={activeAccount} userName={user?.name} />
          </div>

          <AnalyticsChart refreshTrigger={refreshTrigger} />
        </div>

        {/* Right Column: Transaction History */}
        <div style={{ minWidth: 0 }}>
          <TransactionHistory activeAccount={activeAccount} refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Modals */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        senderAccount={activeAccount}
        onSuccess={showNotification}
      />

      <DepositWithdrawModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        mode="DEPOSIT"
        account={activeAccount}
        onSuccess={showNotification}
      />

      <DepositWithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        mode="WITHDRAWAL"
        account={activeAccount}
        onSuccess={showNotification}
      />


      {/* New Account Creation Modal */}
      {isNewAccountOpen && (
        <div className="modal-overlay" onClick={() => setIsNewAccountOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Open New Account</h3>
              <button
                onClick={() => setIsNewAccountOpen(false)}
                style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '1.4rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateNewAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Account Type</label>
                <select
                  id="new-account-type-select"
                  className="input-field"
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                >
                  <option value="savings" style={{ background: '#111827' }}>Savings (High-Yield 4.25% APY)</option>
                  <option value="checking" style={{ background: '#111827' }}>Daily Checking Account</option>
                  <option value="investment" style={{ background: '#111827' }}>Investment & Treasury Vault</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsNewAccountOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  id="submit-new-account-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={newAccLoading}
                  style={{ flex: 1 }}
                >
                  {newAccLoading ? 'Opening...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
