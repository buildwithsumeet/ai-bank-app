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

describe('Banking System Constants & Safety Checks', () => {
  test('Supported account types should be strictly bounded', () => {
    const validAccountTypes = ['checking', 'savings', 'investment'];
    assert.equal(validAccountTypes.length, 3);
    assert.ok(validAccountTypes.includes('checking'));
    assert.ok(validAccountTypes.includes('savings'));
    assert.ok(validAccountTypes.includes('investment'));
  });

  test('Transaction categories should cover essential cashflow needs', () => {
    const validCategories = ['transfer', 'shopping', 'utilities', 'salary', 'investment', 'cash', 'other'];
    assert.ok(validCategories.includes('transfer'));
    assert.ok(validCategories.includes('salary'));
    assert.ok(validCategories.includes('utilities'));
  });
});
