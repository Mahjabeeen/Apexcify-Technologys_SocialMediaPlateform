import { useState, useEffect } from 'react';
import { getMembers, createMember, updateMember, deleteMember } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', plan: 'basic', height: '', weight: '', bloodGroup: '' };

export default function MembersPage() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getMembers({ search, status: filterStatus });
      setMembers(res.data.members || []);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true); };
  const openEdit = (m) => {
    setForm({ name: m.user?.name || '', email: m.user?.email || '', phone: m.user?.phone || '', plan: m.membershipPlan, height: m.height || '', weight: m.weight || '', bloodGroup: m.bloodGroup || '', password: '' });
    setEditId(m._id); setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required');
    setSaving(true);
    try {
      if (editId) {
        await updateMember(editId, { membershipPlan: form.plan, height: form.height, weight: form.weight, bloodGroup: form.bloodGroup });
        toast.success('Member updated!');
      } else {
        await createMember(form);
        toast.success('Member added!');
      }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try { await deleteMember(id); toast.success('Member deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const planColors = { basic: '#94a3b8', premium: '#3b82f6', annual: '#22c55e' };

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Members</h1>
          <p>{members.length} members found</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name or email..." style={{ flex: 1, minWidth: 200 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No members found</div>
          ) : (
            <table>
              <thead>
                <tr><th>Member</th><th>Plan</th><th>Trainer</th><th>Status</th><th>Joined</th>{isAdmin && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-md">{m.user?.name?.[0] || '?'}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{m.user?.name}</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text2)' }}>{m.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="chip" style={{ background: `${planColors[m.membershipPlan]}22`, color: planColors[m.membershipPlan], textTransform: 'capitalize' }}>
                        {m.membershipPlan}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.84rem' }}>
                      {m.trainer?.user?.name || '—'}
                    </td>
                    <td>
                      <span className={`chip ${m.status === 'active' ? 'chip-active' : m.status === 'inactive' ? 'chip-inactive' : m.status === 'suspended' ? 'chip-inactive' : 'chip-pending'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Edit</button>
                          <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(m._id)}>Del</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-title">{editId ? 'Edit Member' : 'Add New Member'}</div>
            {!editId && (
              <>
                <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Member name" /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92-3XX-XXXXXXX" /></div>
                <div className="form-group"><label>Temp Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 chars (default: fitcore123)" /></div>
              </>
            )}
            <div className="form-group">
              <label>Membership Plan</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                <option value="basic">Basic — ₨2,500/mo</option>
                <option value="premium">Premium — ₨5,000/mo</option>
                <option value="annual">Annual — ₨45,000/yr</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}><label>Height (cm)</label><input type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} placeholder="170" /></div>
              <div className="form-group" style={{ flex: 1 }}><label>Weight (kg)</label><input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="70" /></div>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Member'}</button>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
