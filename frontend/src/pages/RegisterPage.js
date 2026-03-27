import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'member' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#111', borderRadius: 16, padding: 36, border: '1px solid #1f1f1f' }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '1.8rem', color: '#ff4d1c', marginBottom: 4 }}>🔥 FITCORE</div>
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '1.9rem', color: '#f0f0f0', letterSpacing: 1, marginBottom: 4 }}>Create Account</h2>
        <p style={{ color: '#666', fontSize: '0.84rem', marginBottom: 24 }}>Join FitCore and start your fitness journey</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#f0f0f0' }} />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#f0f0f0' }} />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#f0f0f0' }} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92-3XX-XXXXXXX" style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#f0f0f0' }} />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#f0f0f0' }}>
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ padding: 12, marginTop: 4 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.8rem', color: '#555' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#ff4d1c', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
