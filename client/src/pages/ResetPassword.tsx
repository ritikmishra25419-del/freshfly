import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--card)', borderRadius: 20, padding: 36, border: '1px solid var(--border)' }}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Password reset!</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Redirecting to home...</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Reset your password
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
              Enter your new password below.
            </div>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="password" placeholder="New password (min 6 chars)"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                required
                style={{ padding: '13px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg)', color: 'var(--text-primary)' }}
              />
              <input
                type="password" placeholder="Confirm new password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                required
                style={{ padding: '13px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg)', color: 'var(--text-primary)' }}
              />
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                style={{ padding: 14, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Resetting...' : 'Reset password →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}