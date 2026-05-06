import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';

export default function CreateTask() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    title: '', subject: 'Data Structures (CS301)', description: '',
    dueDate: '', priority: 'high', assignedTo: 'all'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/attendance/students').then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const publish = async () => {
    if (!form.title.trim()) { toast('Title is required'); return; }
    setSaving(true);
    try {
      const assignedTo = form.assignedTo === 'all'
        ? students.map(s => s._id)
        : [form.assignedTo];
      await api.post('/tasks', {
        title: form.title,
        subject: form.subject,
        description: form.description,
        dueDate: form.dueDate,
        priority: form.priority,
        assignedTo
      });
      toast('Task published to students! 🚀');
      setForm({ title: '', subject: 'Data Structures (CS301)', description: '', dueDate: '', priority: 'high', assignedTo: 'all' });
    } catch (err) {
      toast(err.response?.data?.message || 'Error publishing task');
    } finally { setSaving(false); }
  };

  return (
    <div className="screen active">
      <div className="page-title">Create Task ➕</div>
      <div className="page-sub">Assign new work to students</div>

      <div className="card-block" style={{ maxWidth: '540px' }}>
        <div className="form-group"><label>Task Title</label>
          <input type="text" placeholder="e.g. Implement Binary Search Tree" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} /></div>

        <div className="form-group"><label>Subject / Course</label>
          <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
            <option>Data Structures (CS301)</option>
            <option>Web Dev (CS401)</option>
            <option>DBMS (CS305)</option>
            <option>Algorithms (CS402)</option>
            <option>Operating Systems (CS303)</option>
          </select></div>

        <div className="form-group"><label>Description</label>
          <textarea
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--p100)', borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '90px', background: 'var(--p50)', outline: 'none', color: 'var(--text)' }}
            placeholder="Describe the task requirements..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group"><label>Due Date</label>
            <input type="date" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          <div className="form-group"><label>Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select></div>
        </div>

        <div className="form-group"><label>Assign To</label>
          <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="all">All Students</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select></div>

        <button className="btn-full purple" style={{ marginTop: '1rem' }} onClick={publish} disabled={saving}>
          {saving ? 'Publishing...' : 'Publish Task 🚀'}
        </button>
      </div>
    </div>
  );
}
