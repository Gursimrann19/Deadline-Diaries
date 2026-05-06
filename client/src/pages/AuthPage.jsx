import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AuthPage() {
  const [tab, setTab]         = useState('login');
  const [role, setRole]       = useState('student');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData]   = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', role: 'student' });

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { ...loginData, role });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', signupData);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div id="authScreen" className="screen active">
      <div className="auth-page">
        <div className="auth-deco d1" />
        <div className="auth-deco d2" />
        <div className="auth-deco d3" />
        <div className="auth-card">
          <div className="auth-header">
            <div className="mascot-wrap">
              <div className="book" />
              <div className="star1">⭐</div>
              <div className="star2">✨</div>
              <div className="star3">⭐</div>
            </div>
            <div className="auth-title" style={{ marginTop: '8px' }}>Deadline Diaries</div>
            <div className="auth-sub">Your smart classroom companion</div>
          </div>

          <div className="tab-switch">
            <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
            <button className={tab === 'signup' ? 'active' : ''} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '1rem', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {tab === 'login' ? (
            <div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="you@university.edu" value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                <div className={`role-pill ${role === 'student' ? 'selected' : ''}`} onClick={() => setRole('student')}>
                  <span>🎓</span><p>Student</p>
                </div>
                <div className={`role-pill ${role === 'instructor' ? 'selected' : ''}`} onClick={() => setRole('instructor')}>
                  <span>📚</span><p>Instructor</p>
                </div>
              </div>
              <button className="btn-full purple" onClick={handleLogin} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In ✨'}
              </button>
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Gursimran" value={signupData.name}
                  onChange={e => setSignupData({ ...signupData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="you@university.edu" value={signupData.email}
                  onChange={e => setSignupData({ ...signupData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={signupData.password}
                  onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={signupData.role} onChange={e => setSignupData({ ...signupData, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              <button className="btn-full purple" onClick={handleSignup} disabled={loading} style={{ marginTop: '4px' }}>
                {loading ? 'Creating...' : 'Create Account 🚀'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
