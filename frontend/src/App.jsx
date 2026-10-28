import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './components/AdminDashboard';
import AiAdvisorModal from './components/AiAdvisorModal';

export default function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [currentView, setCurrentView] = useState('customer'); // 'customer' | 'admin'
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        color: 'var(--text-secondary)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(0, 242, 254, 0.2)',
          borderTopColor: 'var(--accent-cyan)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div>Connecting to Apex Secure Network...</div>
      </div>
    );
  }

  // Not logged in -> Show Login or Register
  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  // Authenticated
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewAccount={() => setIsNewAccountOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {currentView === 'admin' && user.role === 'admin' ? (
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
            <AdminDashboard />
          </div>
        ) : (
          <Dashboard
            isNewAccountOpen={isNewAccountOpen}
            setIsNewAccountOpen={setIsNewAccountOpen}
            onOpenChatbot={() => setIsChatbotOpen(true)}
          />
        )}
      </main>

      {/* Floating Chatbot Widget Button */}
      {!isChatbotOpen && (
        <button
          id="floating-ai-chatbot-btn"
          onClick={() => setIsChatbotOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #6366f1 100%)',
            color: '#030712',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 30px rgba(0, 242, 254, 0.45)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span style={{ fontSize: '1.25rem' }}>🤖</span>
          <span>Chat Banking AI</span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }} />
        </button>
      )}

      {/* Interactive Chatbot Modal */}
      <AiAdvisorModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}>
        Apex Trust Bank • MERN Architecture • Secured with 256-bit AES & JWT • Containerized with Docker
      </footer>
    </div>
  );
}

