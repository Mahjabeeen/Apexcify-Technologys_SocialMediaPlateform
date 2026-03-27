import { useState, useEffect } from 'react';
import { getAttendance, checkIn, getMembers, getClasses } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const { isAdmin, isTrainer } = useAuth();
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [marking, setMarking] = useState(false);

  const load = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [attRes, memRes, clsRes] = await Promise.all([
        getAttendance({ date: today }),
        (isAdmin || isTrainer) ? getMembers() : Promise.resolve({ data: { members: [] } }),
        getClasses(),
      ]);
      setRecords(attRes.data.records || []);
      setMembers(memRes.data.members || []);
      setClasses(clsRes.data.classes || []);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCheckIn = async () => {
    if (!selectedMember || !selectedClass) return toast.error('Select member and class');
    setMarking(true);
    try {
      await checkIn({ memberId: selectedMember, classId: selectedClass });
      toast.success('✅ Checked in successfully!');
      setSelectedMember(''); setSelectedClass('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setMarking(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Attendance Tracking</h1>
        <p>Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Manual Check-in */}
        {(isAdmin || isTrainer) && (
          <div className="card">
            <div className="card-header"><span className="card-title">✅ Manual Check-in</span></div>
            <div className="form-group">
              <label>Select Member</label>
              <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
                <option value="">— Choose Member —</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.user?.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">— Choose Class —</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleCheckIn} disabled={marking} style={{ marginTop: 4 }}>
              {marking ? 'Marking...' : '✅ Mark Present'}
            </button>
          </div>
        )}

        {/* QR Scanner */}
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📱</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>QR Code Scanner</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 20 }}>Scan member QR code for instant check-in</div>
          <div style={{ width: 120, height: 120, margin: '0 auto 20px', background: 'var(--bg3)', borderRadius: 12, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
            🔲
          </div>
          <button className="btn btn-primary btn-full">📷 Open Camera Scanner</button>
          <div style={{ marginTop: 10, fontSize: '0.73rem', color: 'var(--text2)' }}>
            Members can show their QR from profile page
          </div>
        </div>
      </div>

      {/* Today's Log */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Today's Attendance Log</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{records.length} records</span>
        </div>
        {loading ? <div className="loader"><div className="spinner" /></div> : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No attendance records for today yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Check-in</th><th>Class</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{r.member?.user?.name?.[0]}</div>
                        {r.member?.user?.name}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text2)' }}>
                      {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{r.class?.name || '—'}</td>
                    <td><span className="chip chip-blue">{r.method}</span></td>
                    <td>
                      <span className={`chip ${r.status === 'present' ? 'chip-active' : r.status === 'late' ? 'chip-pending' : 'chip-inactive'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
