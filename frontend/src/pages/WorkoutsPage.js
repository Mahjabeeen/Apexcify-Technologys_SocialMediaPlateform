import { useState, useEffect } from 'react';
import { getWorkoutPlans, createWorkoutPlan, getDietPlans, createDietPlan } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function WorkoutsPage() {
  const { isAdmin, isTrainer } = useAuth();
  const [plans, setPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('workout');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', level: 'beginner', category: 'strength', duration: 45, daysPerWeek: 3 });
  const [dietForm, setDietForm] = useState({ title: '', description: '', goal: 'maintenance', calories: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [wRes, dRes] = await Promise.all([getWorkoutPlans(), getDietPlans()]);
      setPlans(wRes.data.plans || []);
      setDietPlans(dRes.data.plans || []);
    } catch { toast.error('Failed to load plans'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'workout') {
        if (!form.title) return toast.error('Title required');
        await createWorkoutPlan(form);
      } else {
        if (!dietForm.title) return toast.error('Title required');
        await createDietPlan(dietForm);
      }
      toast.success('Plan created!'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const levelColor = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };
  const goalColor = { weight_loss: '#ef4444', muscle_gain: '#3b82f6', maintenance: '#22c55e', endurance: '#f59e0b' };

  return (
    <div>
      <div className="page-header page-header-row">
        <div><h1>Workout & Diet Plans</h1><p>Trainer-curated fitness programs</p></div>
        {(isAdmin || isTrainer) && <button className="btn btn-primary" onClick={() => setModal(true)}>+ Upload Plan</button>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['workout', '🏋️ Workout Plans'], ['diet', '🥗 Diet Plans']].map(([t, l]) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : tab === 'workout' ? (
        <div className="card">
          <div className="table-wrap">
            {plans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No workout plans yet. Add one!</div>
            ) : (
              <table>
                <thead><tr><th>Plan Name</th><th>Trainer</th><th>Level</th><th>Category</th><th>Duration</th><th>Days/Week</th><th>Assigned</th></tr></thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        {p.description && <div style={{ fontSize: '0.73rem', color: 'var(--text2)' }}>{p.description.slice(0, 50)}...</div>}
                      </td>
                      <td style={{ color: 'var(--text2)' }}>{p.trainer?.user?.name || '—'}</td>
                      <td><span className="chip" style={{ background: `${levelColor[p.level]}22`, color: levelColor[p.level], textTransform: 'capitalize' }}>{p.level}</span></td>
                      <td style={{ textTransform: 'capitalize', color: 'var(--text2)' }}>{p.category}</td>
                      <td>{p.duration} min</td>
                      <td>{p.daysPerWeek}x/week</td>
                      <td><span className="chip chip-blue">{p.assignedTo?.length || 0} members</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {dietPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', gridColumn: '1/-1' }}>No diet plans yet. Add one!</div>
          ) : dietPlans.map(p => (
            <div className="card" key={p._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                <span className="chip" style={{ background: `${goalColor[p.goal]}22`, color: goalColor[p.goal], textTransform: 'capitalize' }}>{p.goal?.replace('_', ' ')}</span>
              </div>
              {p.description && <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 10 }}>{p.description}</div>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {p.calories && <span className="chip chip-blue">🔥 {p.calories} kcal/day</span>}
                <span className="chip chip-active">{p.assignedTo?.length || 0} members</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>By {p.trainer?.user?.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[['workout', 'Workout Plan'], ['diet', 'Diet Plan']].map(([t, l]) => (
                <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>{l}</button>
              ))}
            </div>
            <div className="modal-title">{tab === 'workout' ? '🏋️' : '🥗'} New {tab === 'workout' ? 'Workout' : 'Diet'} Plan</div>

            {tab === 'workout' ? (
              <>
                <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Full Body Blast" /></div>
                <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Level</label>
                    <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                      {['beginner','intermediate','advanced'].map(l => <option key={l} value={l} style={{ textTransform: 'capitalize' }}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {['strength','cardio','flexibility','hiit','yoga','other'].map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ flex: 1 }}><label>Duration (min)</label><input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} /></div>
                  <div className="form-group" style={{ flex: 1 }}><label>Days/Week</label><input type="number" min={1} max={7} value={form.daysPerWeek} onChange={e => setForm(f => ({ ...f, daysPerWeek: +e.target.value }))} /></div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group"><label>Title *</label><input value={dietForm.title} onChange={e => setDietForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Weight Loss Plan" /></div>
                <div className="form-group"><label>Description</label><textarea rows={2} value={dietForm.description} onChange={e => setDietForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Goal</label>
                    <select value={dietForm.goal} onChange={e => setDietForm(f => ({ ...f, goal: e.target.value }))}>
                      {['weight_loss','muscle_gain','maintenance','endurance'].map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}><label>Daily Calories</label><input type="number" value={dietForm.calories} onChange={e => setDietForm(f => ({ ...f, calories: e.target.value }))} placeholder="2000" /></div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Create Plan'}</button>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
