import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav>
      <div className="nav-logo">
        <div className="orb">📖</div>
        Deadline Diaries
      </div>
      <div className="nav-links">
        <span className="nav-role">
          {user?.role === 'instructor' ? '📚 Instructor' : '🎓 Student'}
        </span>
        <button className="nav-btn ghost" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}
