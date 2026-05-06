import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hour   = new Date().getHours();
  const greet  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const suffix = user?.role === 'instructor' ? `, Prof. ${user?.name}! 🌸` : `, ${user?.name}! 🌸`;

  const total    = tasks.length;
  const done     = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.filter(t => t.status === 'progress').length;
  const overdue  = tasks.filter(t => t.status === 'overdue').length;

  const recentTasks = tasks.slice(0, 4);

  return (
    <div className="screen active">
      <div className="page-title">{greet}{suffix}</div>
      <div className="page-sub">Here's what's happening today</div>

      <div className="stats-grid">
        {[
          { icon: '📋', num: total,    label: 'Total Tasks',  pill: 'This week', cls: 'info' },
          { icon: '✅', num: done,     label: 'Completed',    pill: `+${done} done`, cls: 'up' },
          { icon: '⏳', num: progress, label: 'In Progress',  pill: 'Active',    cls: 'info' },
          { icon: '🔥', num: overdue,  label: 'Overdue',      pill: 'Due now',   cls: 'warn' },
        ].map((s, i) => (
          <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.05 + 0.05}s` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num">{loading ? '—' : s.num}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-pill ${s.cls}`}>{s.pill}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card-block">
          <div className="section-header">
            <div className="section-title">📈 Recent Tasks</div>
          </div>
          {loading ? (
            <div className="empty-state"><div className="emo">⏳</div>Loading...</div>
          ) : recentTasks.length === 0 ? (
            <div className="empty-state"><div className="emo">📋</div>No tasks yet</div>
          ) : recentTasks.map(t => (
            <div key={t._id} className="progress-wrap">
              <div className="progress-label">
                <span>{t.title}</span>
                <strong style={{ color: t.status === 'done' ? '#065F46' : t.status === 'overdue' ? '#991B1B' : 'var(--p700)' }}>
                  {t.status}
                </strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{
                  width: t.status === 'done' ? '100%' : t.status === 'progress' ? '60%' : t.status === 'overdue' ? '20%' : '10%',
                  background: t.status === 'done' ? 'linear-gradient(90deg,#6EE7B7,#059669)' : t.status === 'overdue' ? 'linear-gradient(90deg,#FCA5A5,#EF4444)' : undefined
                }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card-block">
          <div className="section-header">
            <div className="section-title">🔔 Notifications</div>
          </div>
          {loading ? (
            <div className="empty-state"><div className="emo">⏳</div>Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="notif">Welcome to StudyFlow! 🎉 Start by creating a task.</div>
          ) : (
            <>
              {tasks.filter(t => t.status === 'overdue').map(t => (
                <div key={t._id} className="notif" style={{ borderLeftColor: '#EF4444' }}>
                  Overdue: <strong>{t.title}</strong> — submit ASAP!
                </div>
              ))}
              {tasks.filter(t => t.status === 'pending').slice(0, 2).map(t => (
                <div key={t._id} className="notif">
                  Pending: <strong>{t.title}</strong>{t.dueDate ? ` due ${new Date(t.dueDate).toLocaleDateString()}` : ''}
                </div>
              ))}
              {tasks.filter(t => t.status === 'done').slice(0, 1).map(t => (
                <div key={t._id} className="notif">
                  Completed: <strong>{t.title}</strong> ✓
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
