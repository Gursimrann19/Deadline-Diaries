import { useState, useCallback } from 'react';

let _showToast = null;

export function useToast() {
  const show = useCallback((msg) => { if (_showToast) _showToast(msg); }, []);
  return show;
}

export default function Toast() {
  const [msg, setMsg]       = useState('');
  const [visible, setVisible] = useState(false);

  _showToast = (message) => {
    setMsg(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 2800);
  };

  if (!visible) return null;
  return (
    <div id="toast" style={{ display: 'block' }}>{msg}</div>
  );
}
