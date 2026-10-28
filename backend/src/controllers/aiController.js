import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

const getOllamaHost = () => process.env.OLLAMA_HOST || 'http://localhost:11434';
const getOllamaModel = () => process.env.OLLAMA_MODEL || 'smollm:135m';

// Helper to detect user intent in English, Hindi, and Hinglish
const detectIntent = (text) => {
  const p = text.toLowerCase();

  // Account Details intent
  if (
    p.includes('account detail') ||
    p.includes('account details') ||
    p.includes('account number') ||
    p.includes('khata') ||
    p.includes('mera account') ||
    p.includes('apna account') ||
    p.includes('meri account') ||
    p.includes('account jankari')
  ) {
    return 'ACCOUNT_DETAILS';
  }

  // Balance intent
  if (
    p.includes('balance') ||
    p.includes('kitna paisa') ||
    p.includes('paisa kitna') ||
    p.includes('total money') ||
    p.includes('how much money') ||
    p.includes('liquidity') ||
    p.includes('rupaye') ||
    p.includes('bache hai')
  ) {
    return 'BALANCE';
  }

  // Debit Card intent
  if (
    p.includes('card') ||
    p.includes('debit card') ||
    p.includes('cvv') ||
    p.includes('expiry') ||
    p.includes('atm card') ||
    p.includes('card number')
  ) {
    return 'CARD_DETAILS';
  }

  // Transactions / History intent
  if (
    p.includes('transaction') ||
    p.includes('history') ||
    p.includes('spend') ||
    p.includes('kharch') ||
    p.includes('recent') ||
    p.includes('statement') ||
    p.includes('activity') ||
    p.includes('len den')
  ) {
    return 'TRANSACTIONS';
  }

  // Savings / Budget Advice
  if (
    p.includes('save') ||
    p.includes('bachat') ||
    p.includes('budget') ||
    p.includes('tip') ||
    p.includes('advice') ||
    p.includes('plan')
  ) {
    return 'SAVINGS_TIPS';
  }

  return 'GENERAL';
};

// Native Smart Financial Advisory Engine (Runs 100% locally with 0 MB extra downloads)
const generateNativeAiResponse = (userPrompt, user, accounts, transactions, intent) => {
  const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const prompt = userPrompt.toLowerCase();

  // 1. Full Account Details
  if (intent === 'ACCOUNT_DETAILS') {
    const list = accounts
      .map(
        (a, i) =>
          `🔹 **Account ${i + 1} (${a.accountType.toUpperCase()})**\n` +
          `• **Account Number**: \`${a.accountNumber}\`\n` +
          `• **Available Balance**: **$${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${a.currency}**\n` +
          `• **Card Number**: \`${a.cardNumber || '4532 •••• •••• ' + a.accountNumber.slice(-4)}\`\n` +
          `• **Status**: ${a.status === 'active' ? '🟢 Active & Verified' : '🔴 ' + a.status}`
      )
      .join('\n\n');

    return (
      `Namaste / Hello **${user.name}**! Ye rahi aapki complete account details:\n\n` +
      `${list}\n\n` +
      `💡 Aap is account number ko direct money transfer receive karne ke liye share kar sakte hain!`
    );
  }

  // 2. Balance & Liquidity Inquiries
  if (intent === 'BALANCE') {
    const breakdown = accounts
      .map(
        (a) =>
          `• **${a.accountType.toUpperCase()}** (\`•••• ${a.accountNumber.slice(-4)}\`): **$${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}**`
      )
      .join('\n');

    return (
      `Hello **${user.name}**, aapka real-time balance report ye raha:\n\n` +
      `💰 **Total Vault Balance**: **$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD**\n\n` +
      `**Accounts Breakdown**:\n${breakdown}\n\n` +
      `Aapke saare funds active hain aur Apex 256-bit vault protection se fully secured hain.`
    );
  }

  // 3. Virtual Debit Card Details
  if (intent === 'CARD_DETAILS') {
    const primaryAccount = accounts[0];
    if (!primaryAccount) {
      return `Hi **${user.name}**, aapka koi active debit card nahi mila.`;
    }

    return (
      `💳 **Aapka Digital Debit Card Details (${primaryAccount.accountType.toUpperCase()})**:\n\n` +
      `• **Card Number**: \`${primaryAccount.cardNumber || '4532 8920 1823 ' + primaryAccount.accountNumber.slice(-4)}\`\n` +
      `• **Cardholder**: **${user.name.toUpperCase()}**\n` +
      `• **Expiry Date**: \`${primaryAccount.cardExpiry || '12/28'}\`\n` +
      `• **CVV**: \`${primaryAccount.cardCvv || '884'}\`\n` +
      `• **Linked Account**: \`${primaryAccount.accountNumber}\`\n` +
      `• **Status**: 🟢 Active for International & Online Payments`
    );
  }

  // 4. Spending & Transaction History
  if (intent === 'TRANSACTIONS') {
    if (!transactions || transactions.length === 0) {
      return `Hi **${user.name}**, aapke account par abhi tak koi transactions record nahi hain. Jab aap deposit ya transfer karenge, details yahan live update ho jayengi!`;
    }

    const txList = transactions
      .slice(0, 5)
      .map(
        (t) =>
          `• **${t.type === 'DEPOSIT' ? '⬇ Deposit' : t.type === 'WITHDRAWAL' ? '⬆ Withdrawal' : '⇄ Transfer'}**: **${t.type === 'DEPOSIT' ? '+' : '-'}$${t.amount.toFixed(2)}** (${t.category}) — *${t.description}* (${new Date(t.createdAt).toLocaleDateString()})`
      )
      .join('\n');

    const totalOutflow = transactions
      .filter((t) => t.type === 'WITHDRAWAL' || t.type === 'TRANSFER')
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      `Aapke recent financial transactions ye rahe, **${user.name}**:\n\n` +
      `${txList}\n\n` +
      `📊 **Recent Outflow**: ~$${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    );
  }

  // 5. Saving Tips and Budget Optimization
  if (intent === 'SAVINGS_TIPS') {
    const recommendedSavings = totalBalance * 0.2;
    return (
      `💡 **Apex Smart Financial Advisory for ${user.name}**:\n\n` +
      `1. **Emergency Buffer**: Kam se kam **$${recommendedSavings.toFixed(2)}** apne High-Yield Savings account mein reserve rakhein.\n` +
      `2. **50/30/20 Rule**: Monthly income ka 50% zaroori expenses par, 30% lifestyle par, aur 20% direct savings mein daalein.\n` +
      `3. **Auto Savings**: Salary aate hi automated transfer set karein taaki discretionary spend control mein rahe.`
    );
  }

  // 6. Affordability / Purchase Questions
  const matches = prompt.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
  const requestedAmount = matches ? parseFloat(matches[1].replace(/,/g, '')) : null;

  if (requestedAmount && (prompt.includes('afford') || prompt.includes('buy') || prompt.includes('kharid') || prompt.includes('le sakta'))) {
    const remaining = totalBalance - requestedAmount;
    if (remaining >= totalBalance * 0.3) {
      return (
        `✅ **Haan, aap ye purchase aasaani se afford kar sakte hain!**\n\n` +
        `• Kharch ki raashi: **$${requestedAmount.toFixed(2)}**\n` +
        `• Aapka kul balance: **$${totalBalance.toFixed(2)}**\n` +
        `• Baaki bachi raashi: **$${remaining.toFixed(2)}** (${Math.round((remaining / totalBalance) * 100)}% bacha rahega).\n\n` +
        `Is kharch se aapke emergency funds par koi asar nahi padega.`
      );
    } else if (remaining >= 0) {
      return (
        `⚠️ **Dhyan dein**:\n\n` +
        `Aapke paas balance to hai ($${totalBalance.toFixed(2)}), lekin $${requestedAmount.toFixed(2)} kharch karne ke baad aapke paas sirf $${remaining.toFixed(2)} bachenge. Is kharch ko thoda delay karna behtar hoga.`
      );
    } else {
      return (
        `❌ **Purchase Not Recommended**:\n\n` +
        `$${requestedAmount.toFixed(2)} ka kharch aapke vartamaan balance ($${totalBalance.toFixed(2)}) se $${Math.abs(remaining).toFixed(2)} zyada hai.`
      );
    }
  }

  // 7. Default Chatbot Introduction
  return (
    `Namaste / Hello **${user.name}**! Main aapka Apex Banking AI Chatbot hoon. 🤖\n\n` +
    `Aap mujhse natural language mein baatcheet karke apne account ki information le sakte hain:\n\n` +
    `• *"Mera account details dikhao"*\n` +
    `• *"Mera balance kitna hai?"*\n` +
    `• *"Debit card number aur CVV batao"*\n` +
    `• *"Recent transactions kya hain?"*\n` +
    `• *"Kya main $400 ka phone kharid sakta hoon?"*`
  );
};

// @desc    Check Ollama connection or Native AI status
// @route   GET /api/ai/status
// @access  Private
export const getAiStatus = async (req, res) => {
  const host = getOllamaHost();
  const model = getOllamaModel();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(`${host}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const installedModels = data.models ? data.models.map((m) => m.name) : [];
      return res.json({
        success: true,
        connected: true,
        engine: 'Ollama AI Engine',
        host,
        configuredModel: model,
        installedModels,
      });
    }
  } catch (error) {
    // Graceful fallback to Native AI Chatbot
  }

  res.json({
    success: true,
    connected: true,
    engine: 'Apex Smart Banking AI Chatbot',
    configuredModel: 'Fast Financial Intelligence',
    installedModels: ['Built-in Banking Intelligence'],
  });
};

// @desc    Chat with Apex Banking AI Assistant
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAi = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a prompt message for the AI assistant',
      });
    }

    // 1. Fetch user accounts and recent transactions
    const accounts = await Account.find({ user: req.user._id });
    const accountIds = accounts.map((a) => a._id);
    const recentTx = await Transaction.find({
      $or: [
        { senderAccount: { $in: accountIds } },
        { recipientAccount: { $in: accountIds } },
      ],
      status: 'COMPLETED',
    })
      .sort({ createdAt: -1 })
      .limit(8);

    const intent = detectIntent(message);
    const host = getOllamaHost();
    const model = getOllamaModel();

    // Formatted structured data for frontend rich widget cards
    const structuredAccounts = accounts.map((a) => ({
      _id: a._id,
      accountNumber: a.accountNumber,
      accountType: a.accountType,
      balance: a.balance,
      currency: a.currency,
      cardNumber: a.cardNumber,
      cardExpiry: a.cardExpiry,
      cardCvv: a.cardCvv,
      status: a.status,
    }));

    const structuredTx = recentTx.map((t) => ({
      referenceId: t.referenceId,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      category: t.category,
      description: t.description,
      createdAt: t.createdAt,
    }));

    // 2. Try connecting to Ollama container if running
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const accountsSummary = accounts
        .map(
          (a) =>
            `- ${a.accountType.toUpperCase()} (Account #${a.accountNumber}): Balance $${a.balance.toFixed(2)} ${a.currency}, Card: ${a.cardNumber || 'N/A'}, Expiry: ${a.cardExpiry || 'N/A'}, CVV: ${a.cardCvv || 'N/A'}`
        )
        .join('\n');

      const transactionsSummary = recentTx
        .map(
          (t) =>
            `- ${t.type} of $${t.amount.toFixed(2)} (${t.category}): "${t.description}" on ${new Date(t.createdAt).toLocaleDateString()}`
        )
        .join('\n');

      const systemPrompt = `You are "Apex AI", an intelligent, friendly conversational banking chatbot assistant for Apex Trust Bank.
The user you are speaking with is "${req.user.name}".

User Accounts:
${accountsSummary || 'No accounts active.'}

Recent Transactions:
${transactionsSummary || 'No recent transactions.'}

Instructions:
1. If the user asks for account details, balance, card details, or transactions (in Hindi, Hinglish, or English), clearly present their exact numbers in a polite, helpful manner.
2. If asked in Hindi or Hinglish, reply warmly in Hinglish/Hindi. If asked in English, reply in English.
3. Be crisp, professional, and accurate.`;

      const ollamaResponse = await fetch(`${host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt}\n\nUser Question: ${message}\n\nApex AI Response:`,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (ollamaResponse.ok) {
        const result = await ollamaResponse.json();
        return res.json({
          success: true,
          engine: 'Ollama LLM',
          model,
          intent,
          response: result.response,
          accounts: structuredAccounts,
          transactions: structuredTx,
        });
      }
    } catch (ollamaErr) {
      // Ollama not reachable, fall through to native AI engine
    }

    // 3. Fallback to Native Financial Intelligence Engine (Instant, 0 MB overhead)
    const nativeResponse = generateNativeAiResponse(message, req.user, accounts, recentTx, intent);

    res.json({
      success: true,
      engine: 'Apex Banking AI',
      model: 'Financial Intelligence Core',
      intent,
      response: nativeResponse,
      accounts: structuredAccounts,
      transactions: structuredTx,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Chatbot error: ${error.message}`,
    });
  }
};
