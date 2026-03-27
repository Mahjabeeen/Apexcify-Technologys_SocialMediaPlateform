import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = {
  admin: [
    { section: 'Main', items: [
      { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
      { to: '/members',    icon: '👥', label: 'Members' },
      { to: '/trainers',   icon: '🎯', label: 'Trainers' },
    ]},
    { section: 'Operations', items: [
      { to: '/classes',    icon: '📅', label: 'Classes' },
      { to: '/attendance', icon: '✅', label: 'Attendance' },
      { to: '/workouts',   icon: '🏋️', label: 'Workout Plans' },
      { to: '/payments',   icon: '💳', label: 'Payments' },
    ]},
  ],
  trainer: [
    { section: 'Main', items: [
      { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
      { to: '/members',    icon: '👥', label: 'My Members' },
      { to: '/classes',    icon: '📅', label: 'Classes' },
    ]},
    { section: 'Tools', items: [
      { to: '/workouts',   icon: '🏋️', label: 'Workout Plans' },
      { to: '/attendance', icon: '✅', label: 'Attendance' },
    ]},
  ],
  member: [
    { section: 'My FitCore', items: [
      { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
      { to: '/classes',    icon: '📅', label: 'Classes' },
      { to: '/workouts',   icon: '🏋️', label: 'My Plans' },
      { to: '/attendance', icon: '✅', label: 'My Attendance' },
      { to: '/payments',   icon: '💳', label: 'Payments' },
    ]},
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS.member;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid #1f1f1f' }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '1.9rem', letterSpacing: '2px', color: '#ff4d1c', display: 'flex', alignItems: 'center', gap: 8 }}>
            🔥 <span style={{ color: '#fff' }}>FIT</span>CORE
          </div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginTop: 2, letterSpacing: '1px' }}>GYM MANAGEMENT SYSTEM</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(section => (
            <div key={section.section}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '2px', color: '#444', padding: '10px 20px 4px', textTransform: 'uppercase' }}>
                {section.section}
              </div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 20px', textDecoration: 'none',
                    fontSize: '0.87rem', fontWeight: 500,
                    color: isActive ? '#ff4d1c' : '#777',
                    background: isActive ? 'rgba(255,77,28,0.1)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? '#ff4d1c' : 'transparent'}`,
                    transition: 'all 0.2s',
                  })}
                >
                  <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom user */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #1f1f1f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <div className="avatar avatar-md">{user?.name?.[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#ff4d1c', textTransform: 'uppercase', letterSpacing: '1px' }}>{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={logout} style={{ borderColor: '#2a2a2a', color: '#666' }}>
            ← Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.3rem', cursor: 'pointer' }}
              className="menu-btn"
            >☰</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            {/* Dark/Light Toggle */}
            <button
              onClick={toggle}
              title="Toggle theme"
              style={{
                background: dark ? '#222' : '#e8e8ea',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '5px 12px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text2)',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
        />
      )}
    </div>
  );
}
