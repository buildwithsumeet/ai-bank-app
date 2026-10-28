import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export default function AiAdvisorModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste / Hello! Main aapka Apex Banking AI Assistant hoon. 🤖\n\nAap mujhse chat karke apna Account Number, Balance, Debit Card details ya Transactions pooch sakte hain!',
      intent: 'GREETING',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      api.getAiStatus()
        .then((res) => setStatus(res))
        .catch(() => setStatus({ connected: true, engine: 'Apex Smart Banking AI' }));
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAi(textToSend);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.response,
            intent: res.intent,
            accounts: res.accounts,
            transactions: res.transactions,
            engine: res.engine,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ Maaf kijiye, temporary issue: ${err.message || 'Could not connect.'}\n\nAap apna balance dashboard par bhi live dekh sakte hain.`,
          intent: 'ERROR',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActionChips = [
    { label: '💳 Mera Account Details', prompt: 'Mera account details dikhao' },
    { label: '💰 Check Balance', prompt: 'Mera balance kitna hai?' },
    { label: '💳 Debit Card & CVV', prompt: 'Debit card number aur details batao' },
    { label: '📜 Recent Transactions', prompt: 'Mera recent transactions dikhao' },
    { label: '💡 Savings Tips', prompt: 'Paisa bachane ke tips do' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1100,
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      height: '620px',
      maxHeight: 'calc(100vh - 48px)',
      display: 'flex',
      flexDirection: 'column',
      background: '#0d1322',
      border: '1px solid rgba(0, 242, 254, 0.35)',
      borderRadius: '20px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 242, 254, 0.2)',
      overflow: 'hidden',
      animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Top Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #111a2e 0%, #0d1322 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 14px rgba(0, 242, 254, 0.35)',
          }}>
            🤖
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>Apex Banking AI</span>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 700,
              }}>
                Online
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Ask balance, account details & cards
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setMessages([{
              sender: 'ai',
              text: 'Chat history cleared. Main aapki kya madad kar sakta hoon?',
              intent: 'GREETING',
            }])}
            title="Clear Chat"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
          >
            Clear
          </button>
          <button
            onClick={onClose}
            title="Close Chatbot"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              width: '28px',
              height: '28px',
              color: '#ffffff',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {/* Bubble */}
            <div style={{
              background: m.sender === 'user'
                ? 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)'
                : 'rgba(21, 31, 50, 0.85)',
              color: m.sender === 'user' ? '#030712' : '#f8fafc',
              padding: '12px 16px',
              borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              fontWeight: m.sender === 'user' ? 600 : 400,
              boxShadow: m.sender === 'user' ? '0 4px 12px rgba(0, 242, 254, 0.25)' : 'none',
            }}>
              {m.text}
            </div>

            {/* Rich Interactive Mini Card for Account Details */}
            {m.intent === 'ACCOUNT_DETAILS' && m.accounts && m.accounts.length > 0 && (
              <div style={{
                marginTop: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {m.accounts.map((acc) => (
                  <div
                    key={acc._id}
                    style={{
                      background: 'linear-gradient(135deg, #162238 0%, #0f172a 100%)',
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                        {acc.accountType} VAULT
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                        ● Active
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                        {acc.accountNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(acc.accountNumber, acc._id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: copiedId === acc._id ? '#34d399' : 'var(--accent-cyan)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {copiedId === acc._id ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Balance:</span>
                      <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rich Interactive Card for Debit Card Details */}
            {m.intent === 'CARD_DETAILS' && m.accounts && m.accounts.length > 0 && (
              <div style={{
                marginTop: '4px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '12px',
                padding: '14px',
                color: '#ffffff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>APEX VIRTUAL DEBIT</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VISA</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {m.accounts[0]?.cardNumber || '4532 8920 1823 9921'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>EXP: <strong style={{ color: '#fff' }}>{m.accounts[0]?.cardExpiry || '12/28'}</strong></span>
                  <span>CVV: <strong style={{ color: 'var(--accent-cyan)' }}>{m.accounts[0]?.cardCvv || '884'}</strong></span>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(21, 31, 50, 0.85)',
            padding: '10px 16px',
            borderRadius: '18px 18px 18px 4px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
            <span>Fetching real-time account data...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div style={{
        padding: '8px 14px',
        background: 'rgba(13, 19, 34, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }}>
        {quickActionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip.prompt)}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              padding: '4px 10px',
              borderRadius: '12px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Field Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: '12px 14px',
          background: '#0a0e1a',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          id="chatbot-input-field"
          type="text"
          className="input-field"
          placeholder="Type here (e.g. mera account details dikhao)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ padding: '10px 14px', fontSize: '0.85rem' }}
        />
        <button
          id="send-chatbot-message-btn"
          type="submit"
          className="btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: '0 16px', borderRadius: '12px', fontSize: '0.9rem' }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
