import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const statusTag = { planning: 'tag-pink', in_progress: 'tag-purple', done: 'tag-purple' };
const statusLabel = { planning: 'Planning', in_progress: 'In Progress', done: 'Done' };
const statusDoneStyle = { done: { background: '#D1FAE5', color: '#065F46' } };

const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
const avColors = ['av1', 'av2', 'av3', 'av4'];

export default function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ name: '', emoji: '🗂️', description: '', dueDate: '', status: 'in_progress', progress: 0 });

  const load = () => {
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const createProject = async () => {
    if (!form.name.trim()) return;
    try {
      await api.post('/projects', form);
      toast('Project created! 🗂️');
      setModal(false);
      setForm({ name: '', emoji: '🗂️', description: '', dueDate: '', status: 'in_progress', progress: 0 });
      load();
    } catch (err) { toast(err.response?.data?.message || 'Error'); }
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p._id !== id));
    toast('Project deleted');
  };

  return (
    <div className="screen active">
      <div className="page-title">Projects 🗂️</div>
      <div className="page-sub">Collaborate on group projects</div>

      <div className="section-header">
        <div />
        <button className="btn-sm purple" onClick={() => setModal(true)}>+ New Project</button>
      </div>

      {loading ? (
        <div className="empty-state"><div className="emo">⏳</div>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state"><div className="emo">📭</div>No projects yet</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {projects.map((p, i) => (
            <div key={p._id} className="project-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="project-emoji">{p.emoji}</div>
                <button onClick={() => deleteProject(p._id)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: '13px' }}>
                  🗑️
                </button>
              </div>
              <div className="project-name">{p.name}</div>
              <div className="project-desc">{p.description}</div>
              <div className="members-row">
                {(p.members || []).slice(0, 4).map((m, idx) => (
                  <div key={m._id || idx} className={`mini-av ${avColors[idx % 4]}`}>
                    {initials(m.name || m)}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`tag ${statusTag[p.status]}`} style={statusDoneStyle[p.status] || {}}>
                  {statusLabel[p.status]}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {p.dueDate ? `Due ${new Date(p.dueDate).toLocaleDateString()}` : 'No deadline'}
                </span>
              </div>
              <div className="progress-track" style={{ marginTop: '8px' }}>
                <div className="progress-fill" style={{
                  width: `${p.progress}%`,
                  background: p.progress === 100 ? 'linear-gradient(90deg,#6EE7B7,#059669)' : undefined
                }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textAlign: 'right' }}>{p.progress}%</div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} title="🗂️ New Project" onClose={() => setModal(false)} onSave={createProject}>
        <div className="form-group"><label>Project Name</label>
          <input type="text" placeholder="e.g. E-Commerce App" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Emoji</label>
          <input type="text" placeholder="🗂️" value={form.emoji}
            onChange={e => setForm({ ...form, emoji: e.target.value })} /></div>
        <div className="form-group"><label>Description</label>
          <input type="text" placeholder="Brief description..." value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-group"><label>Due Date</label>
          <input type="date" value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
        <div className="form-group"><label>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select></div>
        <div className="form-group"><label>Progress ({form.progress}%)</label>
          <input type="range" min="0" max="100" value={form.progress}
            onChange={e => setForm({ ...form, progress: Number(e.target.value) })}
            style={{ width: '100%' }} /></div>
      </Modal>
    </div>
  );
}
