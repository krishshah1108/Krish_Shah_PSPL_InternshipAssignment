import { createContext, useContext, useMemo, useState } from 'react';
import { FiCheckCircle, FiX, FiXCircle } from 'react-icons/fi';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(
    () => ({
      success(message, duration = 3500) {
        if (!message) return;
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type: 'success' }]);
        window.setTimeout(
          () => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
          duration
        );
      },
      error(message, duration = 4500) {
        if (!message) return;
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type: 'error' }]);
        window.setTimeout(
          () => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
          duration
        );
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
            <span className="toast-icon" aria-hidden="true">
              {toast.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
            </span>
            <p>{toast.message}</p>
            <button
              type="button"
              className="toast-close"
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== toast.id))
              }
              aria-label="Dismiss notification"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
