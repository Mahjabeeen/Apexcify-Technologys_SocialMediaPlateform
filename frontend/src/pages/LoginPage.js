import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const demos = [
    { role: 'Admin',   email: 'admin@fitcore.com',  password: 'admin123',   color: '#ff4d1c' },
    { role: 'Trainer', email: 'bilal@fitcore.com',  password: 'trainer123', color: '#3b82f6' },
    { role: 'Member',  email: 'ayesha@email.com',   password: 'member123',  color: '#22c55e' },
  ];

  const fillDemo = (demo) => {
    setForm({ email: demo.email, password: demo.password });
    setSelectedDemo(demo.role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0a' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,28,0.12), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,66,0.07), transparent 70%)' }} />

        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '3.8rem', letterSpacing: '3px', color: '#ff4d1c', lineHeight: 1 }}>
          🔥 <span style={{ color: '#fff' }}>FIT</span>CORE
        </div>
        <div style={{ color: '#555', fontSize: '0.9rem', marginTop: 12, maxWidth: 320, lineHeight: 1.7 }}>
          Pakistan's most powerful gym management platform. Track, train, and transform.
        </div>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {['🏋️ Smart member management', '📊 Real-time analytics dashboard', '📅 Class scheduling & booking', '💳 Payment & subscription tracking', '⏱️ Attendance with QR scanning'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#666', fontSize: '0.85rem' }}>
              <span style={{ color: '#ff4d1c', fontSize: '1rem' }}>{f.split(' ')[0]}</span>
              <span>{f.slice(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#111' }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '2.2rem', letterSpacing: '1px', color: '#f0f0f0', marginBottom: 4 }}>Welcome Back</h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: 24 }}>Sign in to your FitCore dashboard</p>

          {/* Demo role buttons */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>Quick Demo Login</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {demos.map(d => (
                <button
                  key={d.role}
                  onClick={() => fillDemo(d)}
                  style={{
                    flex: 1, padding: '9px 8px', borderRadius: 8, cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600, textAlign: 'center', transition: 'all 0.2s',
                    border: `1px solid ${selectedDemo === d.role ? d.color : '#2a2a2a'}`,
                    background: selectedDemo === d.role ? `${d.color}18` : '#1a1a1a',
                    color: selectedDemo === d.role ? d.color : '#666',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {d.role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@fitcore.com" style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#f0f0f0' }} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#f0f0f0' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ padding: 12, marginTop: 4, fontSize: '0.9rem' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.8rem', color: '#555' }}>
            New member?{' '}
            <Link to="/register" style={{ color: '#ff4d1c', textDecoration: 'none', fontWeight: 600 }}>Create account</Link>
          </div>

          <div style={{ marginTop: 20, padding: 14, background: '#161616', borderRadius: 10, border: '1px solid #222', fontSize: '0.73rem', color: '#555', lineHeight: 1.9 }}>
            <strong style={{ color: '#ff4d1c' }}>Demo Credentials:</strong><br />
            Admin: admin@fitcore.com / admin123<br />
            Trainer: bilal@fitcore.com / trainer123<br />
            Member: ayesha@email.com / member123
          </div>
        </div>
      </div>
    </div>
  );
}
