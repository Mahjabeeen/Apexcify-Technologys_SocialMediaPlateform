import { useState, useEffect } from 'react';
import { getPayments, getPaymentStats, createPayment, markPaid, getMembers } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const { isAdmin, isMember, user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ memberId: '', plan: 'basic', method: 'cash', notes: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      if (isAdmin) {
        const [pRes, sRes, mRes] = await Promise.all([getPayments({ status: filterStatus }), getPaymentStats(), getMembers()]);
        setPayments(pRes.data.payments || []);
        setStats(sRes.data.stats);
        setMembers(mRes.data.members || []);
      } else {
        const pRes = await getPayments();
        setPayments(pRes.data.payments || []);
      }
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filterStatus]);

  const handleCreate = async () => {
    if (!form.memberId || !form.plan) return toast.error('Fill all fields');
    setSaving(true);
    try { await createPayment(form); toast.success('Payment record created!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleMarkPaid = async (id) => {
    try { await markPaid(id); toast.success('Payment marked as paid ✅'); load(); }
    catch { toast.error('Failed'); }
  };

  const planPrices = { basic: 2500, premium: 5000, annual: 45000 };

  return (
    <div>
      <div className="page-header page-header-row">
        <div><h1>Payments</h1><p>Subscription & billing management</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Payment</button>}
      </div>

      {/* Stats */}
      {isAdmin && stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Monthly Revenue', value: `₨${((stats.monthlyRevenue||0)/1000).toFixed(0)}K`, color: '#22c55e' },
            { label: 'Paid This Month',  value: stats.monthlyCount || 0,                           color: '#3b82f6' },
            { label: 'Overdue',          value: stats.overdue || 0,                                color: '#ef4444' },
            { label: 'Pending',          value: stats.pending || 0,                                color: '#f59e0b' },
          ].map(s => (
            <div className="stat-card" key={s.label} style={{ '--card-color': s.color }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Plans info for members */}
      {isMember && (
        <div className="grid-3" style={{ marginBottom: 20 }}>
          {[['basic', '₨2,500/mo', ['Access to gym', 'Basic equipment', '2 classes/week']],
            ['premium', '₨5,000/mo', ['Unlimited classes', 'Personal trainer', 'Diet plan', 'Priority booking']],
            ['annual', '₨45,000/yr', ['Everything in Premium', '2 months free', 'Guest passes', 'Merchandise']],
          ].map(([plan, price, features]) => (
            <div className="card" key={plan} style={{ borderTop: `3px solid ${plan === 'basic' ? '#94a3b8' : plan === 'premium' ? '#3b82f6' : '#22c55e'}` }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize', marginBottom: 4 }}>{plan}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 10 }}>{price}</div>
              {features.map(f => <div key={f} style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: 4 }}>✓ {f}</div>)}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        {isAdmin && (
          <div className="card-header">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
              <option value="">All Status</option>
              {['paid','pending','overdue','failed','refunded'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm">📥 Export</button>
          </div>
        )}
        <div className="table-wrap">
          {loading ? <div className="loader"><div className="spinner" /></div> : payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No payment records found</div>
          ) : (
            <table>
              <thead><tr><th>Member</th><th>Invoice</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th>{isAdmin && <th>Action</th>}</tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.member?.user?.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text2)' }}>{p.invoiceNumber}</td>
                    <td><span className="chip chip-blue" style={{ textTransform: 'capitalize' }}>{p.plan}</span></td>
                    <td style={{ fontWeight: 700 }}>₨{p.amount?.toLocaleString()}</td>
                    <td style={{ color: 'var(--text2)', textTransform: 'capitalize' }}>{p.method?.replace('_', ' ')}</td>
                    <td>
                      <span className={`chip ${p.status === 'paid' ? 'chip-active' : p.status === 'overdue' ? 'chip-inactive' : p.status === 'failed' ? 'chip-inactive' : 'chip-pending'}`} style={{ textTransform: 'capitalize' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : p.dueDate ? `Due: ${new Date(p.dueDate).toLocaleDateString()}` : '—'}
                    </td>
                    {isAdmin && (
                      <td>
                        {p.status !== 'paid' && (
                          <button className="btn btn-green btn-sm" onClick={() => handleMarkPaid(p._id)}>✓ Mark Paid</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-title">Create Payment Record</div>
            <div className="form-group">
              <label>Member *</label>
              <select value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}>
                <option value="">— Select Member —</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.user?.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Plan *</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                <option value="basic">Basic — ₨2,500/mo</option>
                <option value="premium">Premium — ₨5,000/mo</option>
                <option value="annual">Annual — ₨45,000/yr</option>
              </select>
            </div>
            <div style={{ padding: '10px 12px', background: 'rgba(255,77,28,0.06)', borderRadius: 8, marginBottom: 14, fontSize: '0.82rem' }}>
              Amount: <strong style={{ color: 'var(--accent)' }}>₨{planPrices[form.plan]?.toLocaleString()}</strong>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                {['cash','card','bank_transfer','jazzcash','easypaisa'].map(m => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{m.replace('_',' ')}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Record'}</button>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
