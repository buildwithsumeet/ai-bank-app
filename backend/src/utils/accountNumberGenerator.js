import crypto from 'crypto';

// Generate a realistic 10-digit bank account number
export const generateAccountNumber = () => {
  const prefix = '10'; // bank routing prefix
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${prefix}${randomDigits}`;
};

// Generate a 16-digit formatted card number
export const generateCardDetails = () => {
  const bin = '4532'; // Visa prefix
  const middle = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  const rawNumber = `${bin}${middle}`;
  const cardNumber = rawNumber.match(/.{1,4}/g)?.join(' ') || rawNumber;

  const currentYear = new Date().getFullYear() % 100;
  const expiryYear = currentYear + 4;
  const expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const cardExpiry = `${expiryMonth}/${expiryYear}`;

  const cardCvv = String(Math.floor(100 + Math.random() * 900));

  return { cardNumber, cardExpiry, cardCvv };
};

// Generate unique transaction reference
export const generateReferenceId = (type = 'TXN') => {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  const dateStr = Date.now().toString().slice(-6);
  return `${type}-${dateStr}-${randomHex}`;
};
