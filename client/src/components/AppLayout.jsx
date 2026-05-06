import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Toast from './Toast';

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">📖 StudyFlow</div>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Help Center</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-love"></div>
          <div className="footer-love" style={{ marginTop: '4px' }}>⭐ Created by Gursimran</div>
          <div className="footer-copy">© 2025 StudyFlow · All rights reserved · Built with MERN Stack</div>
        </div>
      </footer>
      <Toast />
    </>
  );
}
