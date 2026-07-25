import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  info: 'fa-circle-info',
  warning: 'fa-triangle-exclamation',
};

const TOAST_ICON_COLORS = {
  success: 'text-secondary',
  error: 'text-danger',
  info: 'text-info',
  warning: 'text-warning',
};

const EXIT_DURATION = 400;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    // Mark as leaving so the slide-out animation can play before unmounting.
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, EXIT_DURATION);

    timers.current.set(id, timeout);
  }, []);

  const showToast = useCallback(
    (type, title, message, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, type, title, message, leaving: false }]);
      setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5 pointer-events-none sm:top-5 sm:right-5 max-[480px]:top-2.5 max-[480px]:right-2.5 max-[480px]:left-2.5">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type} ${toast.leaving ? 'hide' : ''}`}>
            <i
              className={`fas ${TOAST_ICONS[toast.type]} ${TOAST_ICON_COLORS[toast.type]} text-2xl shrink-0 max-[480px]:text-xl`}
            />
            <div className="flex-1">
              <div className="font-semibold text-[0.95rem] mb-1 max-[480px]:text-[0.9rem]">
                {toast.title}
              </div>
              <div className="text-[0.85rem] text-muted leading-[1.4] max-[480px]:text-[0.8rem]">
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="bg-transparent text-muted text-[1.2rem] p-0 w-6 h-6 flex items-center justify-center rounded transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              <i className="fas fa-times" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
