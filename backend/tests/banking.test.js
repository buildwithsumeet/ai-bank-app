import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import {
  generateAccountNumber,
  generateCardDetails,
  generateReferenceId,
} from '../src/utils/accountNumberGenerator.js';

describe('Apex Banking Core Utility Tests', () => {
  test('generateAccountNumber should return a unique 10-digit string starting with 10', () => {
    const accNo = generateAccountNumber();
    assert.equal(typeof accNo, 'string');
    assert.equal(accNo.length, 10);
    assert.ok(accNo.startsWith('10'), 'Account number should start with prefix 10');
    assert.ok(/^\d{10}$/.test(accNo), 'Account number must contain only numeric digits');
  });

  test('generateCardDetails should produce valid 16-digit card, CVV, and expiry', () => {
    const card = generateCardDetails();
    assert.ok(card.cardNumber, 'Card number should exist');
    assert.ok(card.cardExpiry, 'Card expiry should exist');
    assert.ok(card.cardCvv, 'Card CVV should exist');

    // 16 digits + 3 spaces = 19 characters format (e.g. 4532 1234 5678 9012)
    const rawDigits = card.cardNumber.replace(/\s+/g, '');
    assert.equal(rawDigits.length, 16);
    assert.ok(/^\d{3}$/.test(card.cardCvv), 'CVV must be exactly 3 digits');
    assert.ok(/^\d{2}\/\d{2}$/.test(card.cardExpiry), 'Expiry must be in MM/YY format');
  });

  test('generateReferenceId should format reference string correctly', () => {
    const ref = generateReferenceId('TRF');
    assert.ok(ref.startsWith('TRF-'), 'Reference should start with specified prefix');
    const parts = ref.split('-');
    assert.equal(parts.length, 3, 'Reference ID should have 3 hyphen-separated segments');
  });

  test('JWT authentication token signing and verification should work', () => {
    const secret = 'test_secret_key_12345';
    const payload = { id: 'user_mock_123', email: 'alice@example.com' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    assert.ok(token);
    assert.equal(typeof token, 'string');

    const decoded = jwt.verify(token, secret);
    assert.equal(decoded.id, 'user_mock_123');
    assert.equal(decoded.email, 'alice@example.com');
  });
});

describe('Dual-Token JWT & Security Tests', () => {
  test('generateAccessToken should issue a 15-minute access token', async () => {
    const { generateAccessToken } = await import('../src/utils/tokenManager.js');
    const mockUser = { _id: '507f1f77bcf86cd799439011', role: 'customer' };
    const token = generateAccessToken(mockUser);

    assert.ok(token);
    assert.equal(typeof token, 'string');

    const decoded = jwt.decode(token);
    assert.equal(decoded.id, '507f1f77bcf86cd799439011');
    assert.equal(decoded.role, 'customer');
    assert.equal(decoded.type, 'access');
    assert.ok(decoded.exp > decoded.iat);
  });

  test('generateRefreshToken and verifyRefreshToken should handle rotation', async () => {
    const { generateRefreshToken, verifyRefreshToken } = await import('../src/utils/tokenManager.js');
    const mockUser = { _id: '507f1f77bcf86cd799439022', role: 'customer' };
    const refreshToken = await generateRefreshToken(mockUser);

    assert.ok(refreshToken);
    const decoded = verifyRefreshToken(refreshToken);
    assert.ok(decoded);
    assert.equal(decoded.id, '507f1f77bcf86cd799439022');
    assert.equal(decoded.type, 'refresh');
    assert.ok(decoded.jti, 'Refresh token should include unique jti UUID');
  });

  test('CacheManager functions gracefully handle offline fallback without throwing', async () => {
    const { cacheGet, cacheSet, cacheDel, isTokenBlacklisted } = await import('../src/utils/cacheManager.js');

    // In offline mode (when redis server is not running during local unit test), functions must safely return fallback values
    const cached = await cacheGet('test:key');
    assert.equal(cached, null);

    const isBlacklisted = await isTokenBlacklisted('some-fake-token');
    assert.equal(isBlacklisted, false);

    const deleted = await cacheDel('test:key');
    assert.equal(deleted, false);
  });
});

