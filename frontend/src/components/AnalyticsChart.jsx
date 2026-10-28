import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AnalyticsChart({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.getAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshTrigger]);

  if (!data) return null;

  const totalFlow = (data.totalIncome || 0) + (data.totalExpense || 0);
  const incomePercent = totalFlow > 0 ? Math.round((data.totalIncome / totalFlow) * 100) : 50;
  const expensePercent = totalFlow > 0 ? 100 - incomePercent : 50;

  const categories = Object.entries(data.categoryBreakdown || {});

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Financial Pulse</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Aggregated cashflow & expense insights
        </p>
      </div>

      {/* Income vs Outflow Dual Meter */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
          <span style={{ color: '#34d399', fontWeight: 600 }}>
            ↓ Inflow: ${data.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({incomePercent}%)
          </span>
          <span style={{ color: '#fb7185', fontWeight: 600 }}>
            ↑ Outflow: ${data.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({expensePercent}%)
          </span>
        </div>

        {/* Visual Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          borderRadius: '5px',
          background: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
        }}>
          <div style={{ width: `${incomePercent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
          <div style={{ width: `${expensePercent}%`, background: 'linear-gradient(90deg, #f43f5e, #fb7185)' }}></div>
        </div>
      </div>

      {/* Net Savings Badge */}
      <div style={{
        background: data.netSavings >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
        border: `1px solid ${data.netSavings >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Period Savings</div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: data.netSavings >= 0 ? '#34d399' : '#fb7185',
          }}>
            {data.netSavings >= 0 ? '+' : ''}${data.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <span style={{ fontSize: '1.5rem' }}>
          {data.netSavings >= 0 ? '📈' : '📉'}
        </span>
      </div>

      {/* Spending by Category */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Expense Breakdown by Category
        </div>

        {categories.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No expense data recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(([categoryName, catAmount]) => {
              const catPercent = data.totalExpense > 0 ? Math.round((catAmount / data.totalExpense) * 100) : 0;
              return (
                <div key={categoryName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: '#e2e8f0' }}>{categoryName}</span>
                    <span style={{ color: 'var(--text-muted)' }}>${catAmount.toFixed(2)} ({catPercent}%)</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${catPercent}%`,
                      height: '100%',
                      background: 'var(--accent-indigo)',
                      borderRadius: '3px',
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
