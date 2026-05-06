import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm]   = useState({ name: '', email: '', department: '', studentId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/profile').then(r => {
      const u = r.data;
      setForm({ name: u.name || '', email: u.email || '', department: u.department || '', studentId: u.studentId || '' });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', {
        name: form.name, department: form.department, studentId: form.studentId
      });
      updateUser({ ...user, name: data.name, department: data.department, studentId: data.studentId });
      toast('Profile saved! ✨');
    } catch (err) {
      toast(err.response?.data?.message || 'Error saving');
    } finally { setSaving(false); }
  };

  return (
    <div className="screen active">
      <div className="page-title">Profile 👤</div>
      <div className="page-sub">Your account details</div>

      <div className="card-block" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--p100)' }}>
          <div className="avatar av1" style={{ width: '60px', height: '60px', fontSize: '20px' }}>
            {initials(form.name)}
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--p800)' }}>{form.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {user?.role === 'instructor' ? 'Instructor · CS Department' : `Student · ${form.department}`}
            </div>
            <span className="tag tag-purple" style={{ marginTop: '4px', display: 'inline-block' }}>
              {user?.role === 'instructor' ? '📚 Instructor' : '🎓 Student'}
            </span>
          </div>
        </div>

        <div className="form-group"><label>Full Name</label>
          <input type="text" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Email</label>
          <input type="email" value={form.email} disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }} /></div>
        <div className="form-group"><label>{user?.role === 'instructor' ? 'Instructor ID' : 'Student ID'}</label>
          <input type="text" value={form.studentId}
            onChange={e => setForm({ ...form, studentId: e.target.value })} /></div>
        <div className="form-group"><label>Department</label>
          <input type="text" value={form.department}
            onChange={e => setForm({ ...form, department: e.target.value })} /></div>

        <button className="btn-sm purple" style={{ marginTop: '4px' }} onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
