import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout     from './components/AppLayout';
import AuthPage      from './pages/AuthPage';
import Dashboard     from './pages/Dashboard';
import Tasks         from './pages/Tasks';
import Assignments   from './pages/Assignments';
import Projects      from './pages/Projects';
import Attendance    from './pages/Attendance';
import CreateTask    from './pages/CreateTask';
import Profile       from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthPage />} />

          {/* Protected routes — any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/tasks"       element={<Tasks />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/projects"    element={<Projects />} />
              <Route path="/profile"     element={<Profile />} />

              {/* Instructor-only routes */}
              <Route element={<ProtectedRoute instructorOnly />}>
                <Route path="/attendance"  element={<Attendance />} />
                <Route path="/create-task" element={<CreateTask />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
