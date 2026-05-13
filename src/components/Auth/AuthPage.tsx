'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AuthPage() {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
    setSuccessMsg('');
    setPassword('');
    setUsername('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg('');

    if (mode === 'register') {
      const success = await register(email, password, username);
      if (success) {
        setSuccessMsg('Account created successfully. Sign in to continue.');
        setMode('login');
        setPassword('');
      }
      return;
    }

    await login(email, password);
  };

  return (
    <div className="auth-shell" style={{ background: 'var(--bg)' }}>
      <div className="auth-grid-glow" />
      <div className="auth-hairline top" />
      <div className="auth-hairline bottom" />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="auth-brand-panel"
      >
        <div className="auth-logo-row">
          <span>Aurora</span>
          <span className="auth-nav-pill">Private beta</span>
        </div>

        <div className="auth-hero-copy">
          <span className="auth-eyebrow">Designed for listening systems</span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          >
            The focused audio workspace.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          >
            Search, collect, organize, and play from one fast interface with a calm Linear-inspired surface.
          </motion.p>
        </div>

        <div className="auth-preview" aria-hidden="true">
          <div className="auth-preview-bar"><span /><span /><span /></div>
          <div className="auth-preview-row active"><span>Discover queue</span><strong>12</strong></div>
          <div className="auth-preview-row"><span>Library tracks</span><strong>48</strong></div>
          <div className="auth-preview-row"><span>Live radio</span><strong>On</strong></div>
        </div>
      </motion.div>

      <div className="auth-form-stage">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="auth-card"
        >
          <div className="auth-mobile-logo">
            <span>Aurora</span>
          </div>

          <div className="auth-card-kicker">Secure access</div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 700, letterSpacing: 0, marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 28 }}>
            {mode === 'login'
              ? 'Sign in to continue to your workspace.'
              : 'Start with a clean listening workspace.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="mark"
                  autoComplete="username"
                  minLength={2}
                  maxLength={40}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingRight: 40 }}
                  placeholder="Password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', display: 'flex',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                  Min 8 characters, with uppercase, lowercase, and a number.
                </p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#EF4444', fontSize: '0.8125rem',
                  }}
                >
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    color: '#22C55E', fontSize: '0.8125rem',
                  }}
                >
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary auth-submit"
            >
              {isLoading ? (
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <button
              onClick={switchMode}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: '0.8125rem',
              }}
            >
              {mode === 'login' ? (
                <>No account yet? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up</span></>
              ) : (
                <>Already have an account? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</span></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
