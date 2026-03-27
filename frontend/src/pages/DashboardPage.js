import { useState, useEffect, useRef } from 'react';
import { getDashStats, getDashActivity } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Workout Timer Component
function WorkoutTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('stopwatch');
  const [countdown, setCountdown] = useState(60);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        if (mode === 'stopwatch') setSeconds(s => s + 1);
        else setCountdown(c => { if (c <= 1) { setRunning(false); return 0; } return c - 1; });
      }, 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running, mode]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div className="card-header">
        <span className="card-title">⏱️ Workout Timer</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['stopwatch', 'countdown'].map(m => (
            <button key={m} className={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setMode(m); setRunning(false); setSeconds(0); setCountdown(60); }}>
              {m === 'stopwatch' ? 'Stopwatch' : 'Countdown'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '3.2rem', letterSpacing: 4, color: '#ff4d1c', margin: '8px 0' }}>
        {fmt(mode === 'stopwatch' ? seconds : countdown)}
      </div>
      {mode === 'countdown' && !running && (
        <div style={{ margin: '8px 0' }}>
          <input type="range" min="10" max="300" step="10" value={countdown}
            onChange={e => setCountdown(+e.target.value)}
            style={{ width: '80%', accentColor: '#ff4d1c' }} />
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 4 }}>{fmt(countdown)}</div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button className={`btn ${running ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button className="btn btn-ghost" onClick={() => { setRunning(false); setSeconds(0); setCountdown(60); }}>↺ Reset</button>
      </div>
    </div>
  );
}

// BMI Calculator Component
function BMICalc() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const bmi = weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : null;
  const cat = bmi ? +bmi < 18.5 ? ['Underweight', '#3b82f6'] : +bmi < 25 ? ['Normal ✓', '#22c55e'] : +bmi < 30 ? ['Overweight', '#f59e0b'] : ['Obese', '#ef4444'] : null;

  return (
    <div className="card">
      <div className="card-header"><span className="card-title">⚖️ BMI Calculator</span></div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" /></div>
        <div style={{ flex: 1 }}><label>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" /></div>
      </div>
      {bmi && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '3rem', color: cat[1] }}>{bmi}</div>
          <div style={{ color: cat[1], fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>{cat[0]}</div>
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${Math.min((+bmi / 40) * 100, 100)}%`, background: cat[1] }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, isTrainer } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin || isTrainer) {
          const [sRes, aRes] = await Promise.all([getDashStats(), getDashActivity()]);
          setStats(sRes.data.stats);
          setActivity(aRes.data);
        }
      } catch (e) {
        // Use fallback data if backend not connected
        setStats({ totalMembers: 284, activeMembers: 241, totalTrainers: 4, totalClasses: 6, todayAttendance: 38, monthlyRevenue: 1200000, overduePayments: 2, newMembersThisMonth: 12 });
      } finally { setLoading(false); }
    };
    load();
  }, [isAdmin, isTrainer]);

  const statCards = isAdmin || isTrainer ? [
    { label: 'Total Members',   value: stats?.totalMembers || 0,    sub: `+${stats?.newMembersThisMonth || 0} this month`, icon: '👥', color: '#ff4d1c' },
    { label: 'Active Classes',  value: stats?.totalClasses || 0,     sub: 'Running today',                                  icon: '🏋️', color: '#3b82f6' },
    { label: 'Monthly Revenue', value: `₨${((stats?.monthlyRevenue || 0)/1000).toFixed(0)}K`, sub: 'Paid this month',    icon: '💰', color: '#22c55e' },
    { label: 'Active Trainers', value: stats?.totalTrainers || 0,    sub: 'On staff',                                       icon: '🎯', color: '#f59e0b' },
  ] : [
    { label: 'Classes Booked',  value: 3,  sub: 'This week',    icon: '📅', color: '#ff4d1c' },
    { label: 'Attendance',      value: '87%', sub: 'This month', icon: '✅', color: '#22c55e' },
    { label: 'Workouts Done',   value: 12,  sub: 'This month',   icon: '🏋️', color: '#3b82f6' },
    { label: 'Days Remaining',  value: 18,  sub: 'In membership', icon: '📆', color: '#f59e0b' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name?.split(' ')[0]}! Here's what's happening at FitCore.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label} style={{ '--card-color': s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{loading ? '—' : s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      {(isAdmin || isTrainer) && (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">🕐 Recent Members</span>
            </div>
            {activity?.recentMembers?.length ? activity.recentMembers.map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar avatar-sm">{m.user?.name?.[0]}</div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{m.user?.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{m.user?.email}</div>
                </div>
                <span className={`chip ${m.status === 'active' ? 'chip-active' : 'chip-pending'}`} style={{ marginLeft: 'auto' }}>{m.status}</span>
              </div>
            )) : [1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <div className="avatar avatar-sm" style={{ background: '#222' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: 'var(--bg3)', borderRadius: 4, width: '60%', marginBottom: 4 }} />
                  <div style={{ height: 10, background: 'var(--bg3)', borderRadius: 4, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">💳 Recent Payments</span></div>
            {activity?.recentPayments?.length ? activity.recentPayments.map(p => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{p.member?.user?.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', textTransform: 'capitalize' }}>{p.plan} plan</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>₨{p.amount?.toLocaleString()}</div>
                  <span className={`chip ${p.status === 'paid' ? 'chip-active' : p.status === 'overdue' ? 'chip-inactive' : 'chip-pending'}`}>{p.status}</span>
                </div>
              </div>
            )) : [1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: 'var(--bg3)', borderRadius: 4, width: '50%', marginBottom: 4 }} />
                  <div style={{ height: 10, background: 'var(--bg3)', borderRadius: 4, width: '30%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unique Tools */}
      <div className="grid-2">
        <WorkoutTimer />
        <BMICalc />
      </div>
    </div>
  );
}
