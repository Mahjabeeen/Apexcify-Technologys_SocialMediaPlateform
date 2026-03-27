import { useState, useEffect } from 'react';
import { getClasses, createClass, enrollClass } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ClassesPage() {
  const { isAdmin, isMember } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'hiit', level: 'beginner', capacity: 20, duration: 60, location: 'Main Hall', color: '#ff4d1c', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await getClasses(); setClasses(res.data.classes || []); }
    catch { toast.error('Failed to load classes'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleEnroll = async (id) => {
    try { await enrollClass(id); toast.success('Enrolled successfully! 🎉'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to enroll'); }
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Class name is required');
    setSaving(true);
    try { await createClass(form); toast.success('Class created!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const COLORS = ['#ff4d1c','#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899'];
  const levelColors = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };

  return (
    <div>
      <div className="page-header page-header-row">
        <div><h1>Class Schedule</h1><p>{classes.length} active classes available</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Class</button>}
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="grid-3">
          {classes.map(c => (
            <div key={c._id} className="card" style={{ borderTop: `3px solid ${c.color || '#ff4d1c'}`, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</div>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${levelColors[c.level]}22`, color: levelColors[c.level], textTransform: 'capitalize' }}>{c.level}</span>
              </div>
              <div style={{ fontSize: '0.79rem', color: 'var(--text2)', marginBottom: 6 }}>
                👤 {c.trainer?.user?.name || 'TBD'}
              </div>
              <div style={{ fontSize: '0.79rem', color: 'var(--text2)', marginBottom: 6 }}>
                📍 {c.location} · {c.duration} min
              </div>
              {c.schedule?.length > 0 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: 10 }}>
                  📅 {c.schedule.map(s => `${s.day.slice(0,3)} ${s.startTime}`).join(', ')}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text2)' }}>Capacity</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{c.enrolled?.length || 0}/{c.capacity}</span>
              </div>
              <div className="progress-wrap" style={{ marginBottom: 12 }}>
                <div className="progress-bar" style={{ width: `${Math.min(((c.enrolled?.length || 0) / c.capacity) * 100, 100)}%`, background: c.color || '#ff4d1c' }} />
              </div>
              {isMember && (
                <button
                  className="btn btn-ghost btn-sm btn-full"
                  onClick={() => handleEnroll(c._id)}
                  disabled={(c.enrolled?.length || 0) >= c.capacity}
                >
                  {(c.enrolled?.length || 0) >= c.capacity ? 'Class Full' : '+ Book Class'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-title">Create New Class</div>
            <div className="form-group"><label>Class Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Morning HIIT" /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['yoga','hiit','strength','cardio','zumba','pilates','crossfit','other'].map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Level</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                  {['beginner','intermediate','advanced'].map(l => <option key={l} value={l} style={{ textTransform: 'capitalize' }}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}><label>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))} /></div>
              <div className="form-group" style={{ flex: 1 }}><label>Duration (min)</label><input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} /></div>
            </div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div className="form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '3px solid transparent', boxSizing: 'border-box' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Creating...' : 'Create Class'}</button>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
