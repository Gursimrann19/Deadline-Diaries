import { useEffect, useRef, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const fileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['zip', 'rar'].includes(ext)) return '📦';
  if (['doc', 'docx'].includes(ext)) return '📝';
  return '📎';
};

const statusBadge = { submitted: 'badge-progress', under_review: 'badge-progress', graded: 'badge-done' };
const statusLabel = { submitted: 'Submitted', under_review: 'Under Review', graded: 'Graded ✓' };

export default function Assignments() {
  const { user } = useAuth();
  const toast = useToast();
  const fileRef = useRef();
  
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks]             = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  const [uploading, setUploading]     = useState(false);
  const [loading, setLoading]         = useState(true);

  const load = () => {
    Promise.all([
      api.get('/assignments'),
      user?.role === 'student' ? api.get('/tasks') : Promise.resolve({ data: [] })
    ]).then(([resAssign, resTasks]) => {
      setAssignments(resAssign.data);
      // Only show tasks that are not yet done
      const pendingTasks = resTasks.data.filter(t => t.status !== 'done');
      setTasks(pendingTasks);
      if (pendingTasks.length > 0 && !selectedTaskId) {
        setSelectedTaskId(pendingTasks[0]._id);
      }
    }).finally(() => setLoading(false));
  };
  
  useEffect(load, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    
    // Attach the selected task info
    if (selectedTaskId) {
       form.append('taskId', selectedTaskId);
       const taskObj = tasks.find(t => t._id === selectedTaskId);
       if (taskObj) form.append('subject', taskObj.subject || taskObj.title);
    }

    try {
      await api.post('/assignments/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast('Assignment uploaded & task marked done! 📤');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/assignments/${id}`);
    setAssignments(prev => prev.filter(a => a._id !== id));
    toast('Deleted');
  };

  return (
    <div className="screen active">
      <div className="page-title">Assignments 📤</div>
      <div className="page-sub">Upload and manage your submitted work</div>

      {user?.role === 'student' && (
        <div style={{ marginBottom: '1rem', background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid var(--p100)' }}>
           <div className="form-group" style={{ marginBottom: 0 }}>
             <label>Submit For Task</label>
             <select 
               value={selectedTaskId} 
               onChange={e => setSelectedTaskId(e.target.value)}
             >
               <option value="">-- General Upload (No specific task) --</option>
               {tasks.map(t => (
                 <option key={t._id} value={t._id}>{t.title} {t.dueDate ? `(Due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}</option>
               ))}
             </select>
           </div>
        </div>
      )}

      <div
        className="upload-zone"
        onClick={() => !uploading && fileRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]); }}
      >
        <div className="upload-ico">{uploading ? '⏳' : '📂'}</div>
        <p><strong>{uploading ? 'Uploading...' : 'Click to upload'}</strong>{!uploading && ' or drag & drop'}</p>
        {!uploading && <p style={{ marginTop: '4px' }}>PDF, DOCX, ZIP up to 50MB</p>}
        <input ref={fileRef} type="file" style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.zip,.txt,.pptx,.xlsx"
          onChange={e => handleUpload(e.target.files[0])} />
      </div>

      <div>
        <div className="section-header" style={{ marginBottom: '8px' }}>
          <div className="section-title">Submitted Files</div>
        </div>
        {loading ? (
          <div className="empty-state"><div className="emo">⏳</div>Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="empty-state"><div className="emo">📭</div>No files submitted yet</div>
        ) : assignments.map((a, i) => (
          <div key={a._id} className="task-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <span style={{ fontSize: '22px' }}>{fileIcon(a.originalName)}</span>
            <div className="task-info">
              <div className="task-name">{a.originalName}</div>
              <div className="task-meta">
                Submitted {new Date(a.createdAt).toLocaleDateString()} · {formatSize(a.fileSize)}
                {a.submittedBy?.name ? ` · ${a.submittedBy.name}` : ''}
              </div>
            </div>
            <span className={`task-badge ${statusBadge[a.status] || 'badge-progress'}`}>
              {statusLabel[a.status] || a.status}
            </span>
            <button onClick={() => handleDelete(a._id)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: '14px' }}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
