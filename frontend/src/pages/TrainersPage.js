import { useState, useEffect } from 'react';
import { getTrainers, createTrainer } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function TrainersPage() {
  const { isAdmin } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialty: '', experience: '', bio: '', salary: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await getTrainers(); setTrainers(res.data.trainers || []); }
    catch { toast.error('Failed to load trainers'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      await createTrainer({ ...form, specialty: form.specialty.split(',').map(s => s.trim()), experience: +form.experience, salary: +form.salary });
      toast.success('Trainer added!'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header page-header-row">
        <div><h1>Trainers</h1><p>Manage your training staff</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Trainer</button>}
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="grid-2">
          {trainers.map(t => (
            <div className="card" key={t._id}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                <div className="avatar avatar-lg" style={{ borderRadius: 14 }}>{t.user?.name?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>{t.user?.name}</div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.78rem', margin: '3px 0' }}>
                    {Array.isArray(t.specialty) ? t.specialty.join(', ') : t.specialty}
                  </div>
                  <span className={`chip ${t.status === 'active' ? 'chip-active' : t.status === 'on-leave' ? 'chip-pending' : 'chip-inactive'}`}>{t.status}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[['Members', t.members?.length || 0], ['Exp', `${t.experience}y`], ['Rating', `⭐ ${t.rating || 0}`]].map(([k, v]) => (
                  <div key={k} style={{ textAlign: 'center', padding: 10, background: 'var(--bg)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{v}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{k}</div>
                  </div>
                ))}
              </div>
              {t.bio && <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text2)' }}>{t.bio}</div>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-title">Add New Trainer</div>
            {[['name','Full Name *',''],['email','Email *','trainer@fitcore.com'],['phone','Phone',''],['specialty','Specialties (comma separated)','Yoga, HIIT'],['experience','Years of Experience',''],['bio','Bio',''],['salary','Monthly Salary (₨)','']].map(([k,l,p]) => (
              <div className="form-group" key={k}>
                <label>{l}</label>
                {k === 'bio' ? <textarea rows={3} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} /> : <input type={['experience','salary'].includes(k) ? 'number' : 'text'} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} />}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Adding...' : 'Add Trainer'}</button>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
