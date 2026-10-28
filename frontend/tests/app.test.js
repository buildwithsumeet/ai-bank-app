import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Frontend Banking Utilities & API Client Interface', () => {
  test('Currency formatting utility should handle USD balances properly', () => {
    const formatUSD = (val) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    assert.equal(formatUSD(14250.75), '$14,250.75');
    assert.equal(formatUSD(0), '$0.00');
    assert.equal(formatUSD(5000), '$5,000.00');
  });

  test('Card masking should conceal 12 digits and reveal last 4', () => {
    const maskCard = (cardNo) => {
      const clean = cardNo.replace(/\s+/g, '');
      return `•••• •••• •••• ${clean.slice(-4)}`;
    };

    const masked = maskCard('4532 9812 7341 8920');
    assert.equal(masked, '•••• •••• •••• 8920');
  });

  test('Account masking should format 10-digit account number securely', () => {
    const maskAccount = (accNo) => `••••••${accNo.slice(-4)}`;
    assert.equal(maskAccount('1089234812'), '••••••4812');
  });

  test('API Client methods specification contract', async () => {
    const { api } = await import('../src/api/client.js');
    assert.ok(api);
    assert.equal(typeof api.login, 'function');
    assert.equal(typeof api.register, 'function');
    assert.equal(typeof api.getProfile, 'function');
    assert.equal(typeof api.seedDemoDatabase, 'function');
    assert.equal(typeof api.getMyAccounts, 'function');
    assert.equal(typeof api.createAccount, 'function');
    assert.equal(typeof api.lookupAccount, 'function');
    assert.equal(typeof api.deposit, 'function');
    assert.equal(typeof api.withdraw, 'function');
    assert.equal(typeof api.transfer, 'function');
    assert.equal(typeof api.getTransactions, 'function');
    assert.equal(typeof api.getAnalytics, 'function');
    assert.equal(typeof api.chatWithAi, 'function');
  });
});
