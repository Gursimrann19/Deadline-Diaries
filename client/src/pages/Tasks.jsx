import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const statusBadge = { pending: 'badge-pending', progress: 'badge-progress', done: 'badge-done', overdue: 'badge-overdue' };
const statusLabel = { pending: 'Pending', progress: 'In Progress', done: 'Done', overdue: 'Overdue' };

export default function Tasks() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks]     = useState([]);
  const [filter, setFilter]   = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ title: '', subject: '', dueDate: '', status: 'pending' });

  const load = () => {
    setLoading(true);
    api.get('/tasks').then(r => setTasks(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleDone = async (task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    await api.put(`/tasks/${task._id}`, { status: newStatus });
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
  };

  const addTask = async () => {
    if (!form.title.trim()) return;
    try {
      await api.post('/tasks', { ...form, assignedTo: [] });
      toast('Task added! ✅');
      setModal(false);
      setForm({ title: '', subject: '', dueDate: '', status: 'pending' });
      load();
    } catch (err) { toast(err.response?.data?.message || 'Error'); }
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
    toast('Task deleted');
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const filterBtns = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  return (
    <div className="screen active">
      <div className="page-title">My Tasks 📋</div>
      <div className="page-sub">Track all your pending and completed work</div>

      <div className="section-header">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filterBtns.map(f => (
            <button key={f.key} className="btn-sm outline"
              style={filter === f.key ? { background: 'var(--p500)', color: 'white', borderColor: 'var(--p500)' } : {}}
              onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <button className="btn-sm purple" onClick={() => setModal(true)}>+ Add Task</button>
      </div>

      {loading ? (
        <div className="empty-state"><div className="emo">⏳</div>Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="emo">📭</div>No tasks here</div>
      ) : (
        <div className="task-list">
          {filtered.map((t, i) => (
            <div key={t._id} className="task-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`task-check ${t.status === 'done' ? 'done' : ''}`} onClick={() => toggleDone(t)}>
                {t.status === 'done' ? '✓' : ''}
              </div>
              <div className="task-info">
                <div className={`task-name ${t.status === 'done' ? 'done' : ''}`}>{t.title}</div>
                <div className="task-meta">
                  {t.subject}{t.createdBy?.name ? ` · ${t.createdBy.name}` : ''}
                </div>
              </div>
              <span className={`task-badge ${statusBadge[t.status] || 'badge-pending'}`}>
                {statusLabel[t.status] || t.status}
              </span>
              <span className="task-due">
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
              </span>
              {user?.role === 'instructor' && (
                <button onClick={() => deleteTask(t._id)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: '14px' }}>
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} title="➕ Add New Task" onClose={() => setModal(false)} onSave={addTask}>
        <div className="form-group"><label>Task Name</label>
          <input type="text" placeholder="e.g. Complete Lab Report" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label>Subject</label>
          <input type="text" placeholder="e.g. Data Structures" value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="form-group"><label>Due Date</label>
          <input type="date" value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
        <div className="form-group"><label>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="progress">In Progress</option>
            <option value="done">Done</option>
          </select></div>
      </Modal>
    </div>
  );
}
