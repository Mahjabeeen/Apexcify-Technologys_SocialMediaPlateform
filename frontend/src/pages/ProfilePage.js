import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updatePassword, getMemberQR } from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState(null);

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Min 6 characters');
    setSaving(true);
    try {
      await updatePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password updated!');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header"><h1>My Profile</h1><p>Manage your account settings</p></div>

      <div className="grid-2">
        {/* Profile Info */}
        <div className="card">
          <div className="card-header"><span className="card-title">👤 Account Info</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.4rem', borderRadius: 16 }}>{user?.name?.[0]}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text2)', fontSize: '0.84rem' }}>{user?.email}</div>
              <span className={`badge badge-${user?.role}`} style={{ marginTop: 6, display: 'inline-flex' }}>{user?.role}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Email', user?.email], ['Role', user?.role], ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{k}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Password Change */}
        <div className="card">
          <div className="card-header"><span className="card-title">🔒 Change Password</span></div>
          <form onSubmit={handlePassword}>
            <div className="form-group"><label>Current Password</label><input type="password" value={passForm.currentPassword} onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" /></div>
            <div className="form-group"><label>New Password</label><input type="password" value={passForm.newPassword} onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min 6 characters" /></div>
            <div className="form-group"><label>Confirm New Password</label><input type="password" value={passForm.confirm} onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
          </form>
        </div>

        {/* QR Code for Members */}
        {user?.role === 'member' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-header"><span className="card-title">📱 My QR Code</span></div>
            <p style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: 16 }}>Show this QR at the gym for quick check-in</p>
            {qr ? (
              <img src={qr} alt="Member QR Code" style={{ width: 180, height: 180, borderRadius: 12, border: '2px solid var(--border)' }} />
            ) : (
              <div style={{ width: 180, height: 180, margin: '0 auto 16px', background: 'var(--bg3)', borderRadius: 12, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🔲</div>
            )}
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={async () => {
              try {
                // In real app: const res = await getMemberQR(memberId); setQr(res.data.qrCode);
                toast.success('QR code generated!');
              } catch { toast.error('Failed to get QR'); }
            }}>
              {qr ? '🔄 Refresh QR' : '📲 Generate QR Code'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
