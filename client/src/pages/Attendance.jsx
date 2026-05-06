import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';

const avColors = ['av1', 'av2', 'av3', 'av4'];
const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

export default function Attendance() {
  const toast = useToast();
  const [students, setStudents]   = useState([]);
  const [marks, setMarks]         = useState({});   // { userId: 'present' | 'absent' }
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [course, setCourse]       = useState('Web Development (CS401)');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      api.get('/attendance/students'),
      api.get('/attendance')
    ]).then(([s, r]) => {
      setStudents(s.data);
      setRecords(r.data);
      // default all present
      const defaults = {};
      s.data.forEach(st => { defaults[st._id] = 'present'; });
      setMarks(defaults);
    }).finally(() => setLoading(false));
  }, []);

  const mark = (userId, status) => setMarks(prev => ({ ...prev, [userId]: status }));

  const save = async () => {
    try {
      const payload = {
        date: today,
        course,
        students: students.map(s => ({ user: s._id, status: marks[s._id] || 'present' }))
      };
      await api.post('/attendance', payload);
      toast('Attendance saved! ✅');
    } catch (err) { toast(err.response?.data?.message || 'Error saving attendance'); }
  };

  const presentCount = Object.values(marks).filter(v => v === 'present').length;
  const absentCount  = students.length - presentCount;
  const pct = students.length ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="screen active">
      <div className="page-title">Mark Attendance ✅</div>
      <div className="page-sub">Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>

      <div className="card-block" style={{ marginBottom: '1rem' }}>
        <div className="form-group" style={{ marginBottom: '0.8rem' }}>
          <label>Course</label>
          <select value={course} onChange={e => setCourse(e.target.value)}>
            <option>Web Development (CS401)</option>
            <option>Data Structures (CS301)</option>
            <option>DBMS (CS305)</option>
            <option>Algorithms (CS402)</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '13px' }}>
          <span style={{ color: '#065F46', fontWeight: 600 }}>✓ {presentCount} Present</span>
          <span style={{ color: '#991B1B', fontWeight: 600 }}>✗ {absentCount} Absent</span>
          <span style={{ color: 'var(--muted)' }}>Attendance: {pct}%</span>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Today's Class — Mark Students</div>
        <button className="btn-sm purple" onClick={save}>Save All</button>
      </div>

      {loading ? (
        <div className="empty-state"><div className="emo">⏳</div>Loading students...</div>
      ) : students.length === 0 ? (
        <div className="empty-state"><div className="emo">👥</div>No students registered yet</div>
      ) : students.map((s, i) => (
        <div key={s._id} className="student-row" style={{ animationDelay: `${i * 0.05}s` }}>
          <div className={`avatar ${avColors[i % 4]}`}>{initials(s.name)}</div>
          <div className="student-name">{s.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', flex: 1 }}>{s.email}</div>
          <div className="attend-toggle">
            <button
              className={`att-btn p ${marks[s._id] === 'present' ? 'active-p' : ''}`}
              onClick={() => mark(s._id, 'present')}>P</button>
            <button
              className={`att-btn a ${marks[s._id] === 'absent' ? 'active-a' : ''}`}
              onClick={() => mark(s._id, 'absent')}>A</button>
          </div>
        </div>
      ))}

      {records.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="section-title" style={{ marginBottom: '10px' }}>📅 Past Records</div>
          {records.slice(0, 5).map(r => (
            <div key={r._id} className="notif" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>{r.course}</strong> — {new Date(r.date).toLocaleDateString()}</span>
              <span style={{ color: 'var(--p700)', fontWeight: 600 }}>
                {r.students.filter(s => s.status === 'present').length}/{r.students.length} present
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
