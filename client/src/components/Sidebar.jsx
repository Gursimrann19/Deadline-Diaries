import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { icon: '🏠', label: 'Dashboard',   path: '/dashboard' },
  { icon: '📋', label: 'My Tasks',    path: '/tasks' },
  { icon: '📤', label: 'Assignments', path: '/assignments' },
  { icon: '🗂️', label: 'Projects',   path: '/projects' },
];

const instructorLinks = [
  { icon: '✅', label: 'Attendance',  path: '/attendance' },
  { icon: '➕', label: 'Create Task', path: '/create-task' },
];

const accountLinks = [
  { icon: '👤', label: 'Profile', path: '/profile' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const Item = ({ icon, label, path }) => (
    <div
      className={`sidebar-item ${pathname === path ? 'active' : ''}`}
      onClick={() => navigate(path)}
    >
      <span className="ico">{icon}</span> {label}
    </div>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Menu</div>
        {studentLinks.map(l => <Item key={l.path} {...l} />)}
      </div>
      {user?.role === 'instructor' && (
        <div className="sidebar-section">
          <div className="sidebar-label">Instructor</div>
          {instructorLinks.map(l => <Item key={l.path} {...l} />)}
        </div>
      )}
      <div className="sidebar-section">
        <div className="sidebar-label">Account</div>
        {accountLinks.map(l => <Item key={l.path} {...l} />)}
      </div>
    </div>
  );
}
