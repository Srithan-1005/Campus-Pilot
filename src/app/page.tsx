'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './landing.module.css';

export default function LandingPage() {
  const router = useRouter();
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery states
  const [recoveryMode, setRecoveryMode] = useState<'NONE' | 'FORGOT' | 'RESET'>('NONE');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  const handleLogin = async (e: React.FormEvent, customEmail?: string, customPassword?: string) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store user details in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'STUDENT' && data.user.studentProfile) {
        router.push(`/student?studentId=${data.user.studentProfile.id}`);
      } else if (data.user.role === 'TEACHER') {
        router.push('/teacher');
      } else if (data.user.role === 'PARENT' && data.user.parentProfile) {
        const studentCode = data.user.parentProfile.student?.studentCode || 'STU001';
        router.push(`/parent?studentCode=${studentCode}`);
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoveryMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setRecoveryMessage(data.message || 'Reset instructions sent.');
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        setRecoveryMode('RESET');
      } else {
        setError(data.error || 'Could not initiate reset.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoveryMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail, token: resetToken, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setRecoveryMessage(data.message || 'Password successfully updated.');
        setTimeout(() => {
          setRecoveryMode('NONE');
          setRecoveryMessage('');
          setEmail(recoveryEmail);
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.backgroundGlows}>
        <div className={styles.glowPrimary}></div>
        <div className={styles.glowSecondary}></div>
      </div>

      <div className={`${styles.loginCard} glass-panel animate-fade-in`}>
        <div className={styles.header}>
          <div className={styles.logo}>🧭</div>
          <h1>Campus Pilot</h1>
          <p>Smart Campus Super App Platform</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {recoveryMessage && (
          <div className="badge badge-success" style={{ display: 'block', padding: '12px', textAlign: 'center', marginBottom: '16px', fontSize: '0.85rem' }}>
            {recoveryMessage}
          </div>
        )}

        {recoveryMode === 'NONE' && (
          <form onSubmit={(e) => handleLogin(e)}>
            <div className="form-group">
              <label className="form-label">Campus Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <span 
                  onClick={() => setRecoveryMode('FORGOT')} 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {recoveryMode === 'FORGOT' && (
          <form onSubmit={handleForgotPassword}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>Recover Account Access</h3>
            <div className="form-group">
              <label className="form-label">Enter Campus Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@campus.edu"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Sending...' : 'Reset Link'}
              </button>
              <button type="button" onClick={() => setRecoveryMode('NONE')} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {recoveryMode === 'RESET' && (
          <form onSubmit={handleResetPassword}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>Reset Your Password</h3>
            <div className="form-group">
              <label className="form-label">Reset Code / Token</label>
              <input
                type="text"
                className="form-input"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Saving...' : 'Update Password'}
              </button>
              <button type="button" onClick={() => setRecoveryMode('NONE')} className="btn btn-secondary" style={{ flex: 1 }}>
                Back to Login
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <span onClick={() => router.push('/signup')} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}>Register Here</span>
        </div>

        <div className={styles.divider}>
          <span>OR QUICK ACCESS FOR EVALUATION</span>
        </div>

        <div className={styles.demoAccounts}>
          <button
            onClick={(e) => handleLogin(e, 'student@campus.edu', 'student123')}
            className={`${styles.demoBtn} glass-panel`}
            disabled={loading}
          >
            <div className={styles.demoAvatar}>👨‍🎓</div>
            <div className={styles.demoInfo}>
              <strong>Student Portal</strong>
              <span>Alex Carter (CSE)</span>
            </div>
            <div className={styles.demoBadge}>STU001</div>
          </button>

          <button
            onClick={(e) => handleLogin(e, 'admin@campus.edu', 'admin123')}
            className={`${styles.demoBtn} glass-panel`}
            disabled={loading}
          >
            <div className={styles.demoAvatar}>👩‍🏫</div>
            <div className={styles.demoInfo}>
              <strong>Admin Dashboard</strong>
              <span>Dr. Sarah Jenkins (Dean)</span>
            </div>
            <div className={styles.demoBadge}>ADMIN</div>
          </button>

          <button
            onClick={() => router.push('/parent?studentCode=STU001')}
            className={`${styles.demoBtn} glass-panel`}
            disabled={loading}
            style={{ border: '1px dashed var(--accent-primary)' }}
          >
            <div className={styles.demoAvatar}>👨‍👩‍👦</div>
            <div className={styles.demoInfo}>
              <strong>Parent Portal</strong>
              <span>Robert Carter (Alex's Father)</span>
            </div>
            <div className={styles.demoBadge}>PARENT</div>
          </button>
        </div>
      </div>
    </main>
  );
}
