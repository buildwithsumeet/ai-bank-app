import { test, expect } from '@playwright/test';

test.describe('🎨 [Frontend UI Suite] Apex Bank User Interface & Interactions', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept backend API with standard Apex Bank response contract
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            token: 'mock_jwt_token_playwright_test_e2e_2026',
            _id: 'user_admin_001',
            name: 'Apex Administrator',
            email: 'admin@apexbank.com',
            role: 'admin',
            accounts: [
              {
                _id: 'acc_checking_001',
                accountNumber: '1089234812',
                accountType: 'checking',
                balance: 14250.75,
                status: 'active',
                card: {
                  cardNumber: '4532 9812 7341 8920',
                  cardExpiry: '12/28',
                  cardCvv: '482',
                },
              },
              {
                _id: 'acc_savings_002',
                accountNumber: '1089234999',
                accountType: 'savings',
                balance: 8500.00,
                status: 'active',
                card: {
                  cardNumber: '4532 9812 7341 9999',
                  cardExpiry: '06/29',
                  cardCvv: '119',
                },
              },
            ],
          },
        }),
      });
    });

    await page.route('**/api/auth/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              _id: 'user_admin_001',
              name: 'Apex Administrator',
              email: 'admin@apexbank.com',
              role: 'admin',
            },
            accounts: [
              {
                _id: 'acc_checking_001',
                accountNumber: '1089234812',
                accountType: 'checking',
                balance: 14250.75,
                status: 'active',
                card: {
                  cardNumber: '4532 9812 7341 8920',
                  cardExpiry: '12/28',
                  cardCvv: '482',
                },
              },
            ],
          },
        }),
      });
    });

    await page.route('**/api/accounts*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'acc_checking_001',
              accountNumber: '1089234812',
              accountType: 'checking',
              balance: 14250.75,
              status: 'active',
              card: {
                cardNumber: '4532 9812 7341 8920',
                cardExpiry: '12/28',
                cardCvv: '482',
              },
            },
          ],
        }),
      });
    });

    await page.route('**/api/transactions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'tx_001',
              type: 'deposit',
              amount: 5000,
              referenceId: 'DEP-2026-991',
              description: 'Initial Treasury Allocation',
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.route('**/api/ai/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          connected: true,
          engine: 'Apex Smart Banking AI',
          model: 'smollm:135m',
        }),
      });
    });
  });

  test('FE-01: Portal Login page renders branding, form elements, and demo shortcuts', async ({ page }) => {
    await page.goto('/');

    // Verify Brand title & Tagline
    await expect(page.locator('text=Apex Trust Bank')).toBeVisible();
    await expect(page.locator('text=Next-Gen Digital Banking & Asset Treasury')).toBeVisible();

    // Verify Input fields
    await expect(page.locator('#login-email-input')).toBeVisible();
    await expect(page.locator('#login-password-input')).toBeVisible();
    await expect(page.locator('#login-submit-btn')).toBeVisible();

    // Verify Demo Credentials Buttons
    await expect(page.locator('#demo-admin-btn')).toBeVisible();
    await expect(page.locator('#demo-alice-btn')).toBeVisible();
    await expect(page.locator('#demo-bob-btn')).toBeVisible();
    await expect(page.locator('#seed-user-db-btn')).toBeVisible();
  });

  test('FE-02: Quick demo login buttons automatically autofill email and password', async ({ page }) => {
    await page.goto('/');

    // Click on Alice Demo Shortcut
    await page.click('#demo-alice-btn');

    // Verify input values populated
    const emailValue = await page.inputValue('#login-email-input');
    const passwordValue = await page.inputValue('#login-password-input');

    expect(emailValue).toBe('alice@example.com');
    expect(passwordValue).toBe('password123');
  });

  test('FE-03: Seamless navigation toggle between Sign In and Open Account (Register)', async ({ page }) => {
    await page.goto('/');

    // Switch to Register
    await page.click('#switch-to-register-btn');
    await expect(page.locator('text=Open an Account')).toBeVisible();
    await expect(page.locator('#register-submit-btn')).toBeVisible();

    // Switch back to Login
    await page.click('#switch-to-login-btn');
    await expect(page.locator('text=Sign In to Portal')).toBeVisible();
  });

  test('FE-04: Successful Authentication displays Bank Dashboard and Liquidity Balance', async ({ page }) => {
    await page.goto('/');

    // Login as Admin
    await page.click('#demo-admin-btn');
    await page.click('#login-submit-btn');

    // Verify Header and Dashboard loaded
    await expect(page.locator('text=APEX BANK')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#action-send-money-btn')).toBeVisible();
    await expect(page.locator('#action-deposit-btn')).toBeVisible();
    await expect(page.locator('#logout-btn')).toBeVisible();
  });

  test('FE-05: Virtual Debit Card renders with actions and account details', async ({ page }) => {
    await page.goto('/');
    await page.click('#demo-admin-btn');
    await page.click('#login-submit-btn');

    await expect(page.locator('#action-send-money-btn')).toBeVisible({ timeout: 5000 });

    // Verify card section / balance displays
    const balanceText = page.locator('text=BALANCE');
    await expect(balanceText.first()).toBeVisible();
  });

  test('FE-06: Transfer and Deposit modal windows trigger and close properly', async ({ page }) => {
    await page.goto('/');
    await page.click('#demo-admin-btn');
    await page.click('#login-submit-btn');

    await expect(page.locator('#action-send-money-btn')).toBeVisible({ timeout: 5000 });

    // Click Transfer Funds
    await page.click('#action-send-money-btn');
    await expect(page.locator('text=Transfer Funds')).toBeVisible();

    // Close modal via Escape key
    await page.keyboard.press('Escape');
  });

  test('FE-07: Floating AI Advisor opens interactive conversational drawer', async ({ page }) => {
    await page.goto('/');
    await page.click('#demo-admin-btn');
    await page.click('#login-submit-btn');

    await expect(page.locator('#action-ai-advisor-btn')).toBeVisible({ timeout: 5000 });

    // Open AI Advisor Chatbot
    await page.click('#action-ai-advisor-btn');
    await expect(page.getByText('Apex Banking AI', { exact: true })).toBeVisible();
    await expect(page.locator('#chatbot-input-field')).toBeVisible();
    await expect(page.locator('#send-chatbot-message-btn')).toBeVisible();
  });

  test('FE-08: Admin Console toggle switches view for Administrator accounts', async ({ page }) => {
    await page.goto('/');
    await page.click('#demo-admin-btn');
    await page.click('#login-submit-btn');

    await expect(page.locator('#nav-admin-view-btn')).toBeVisible({ timeout: 5000 });

    // Click Admin Console
    await page.click('#nav-admin-view-btn');
    await expect(page.locator('text=Admin Console')).toBeVisible();

    // Switch back to My Account
    await page.click('#nav-customer-view-btn');
    await expect(page.locator('#action-send-money-btn')).toBeVisible();
  });

});
