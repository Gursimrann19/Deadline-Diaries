import { useEffect } from 'react';

export default function Modal({ isOpen, title, onClose, onSave, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target.classList.contains('modal-overlay')) onClose(); }}
    >
      <div className="modal-box">
        <div className="modal-title">{title}</div>
        <div>{children}</div>
        <div className="modal-actions">
          <button className="btn-sm outline" onClick={onClose}>Cancel</button>
          <button className="btn-sm purple" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
