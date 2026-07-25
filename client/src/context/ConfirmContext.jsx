import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

const DEFAULT_STATE = {
  open: false,
  title: '',
  message: '',
  variant: 'success',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
};

const VARIANT_ICONS = {
  success: 'fa-circle-check text-secondary',
  danger: 'fa-triangle-exclamation text-danger',
  info: 'fa-circle-question text-info',
  contact: 'fa-user-plus text-secondary',
};

/**
 * Promise-based replacement for window.confirm, styled to match the app.
 * Usage: `const ok = await confirm({ title, message, variant: 'danger' })`
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    setState({ ...DEFAULT_STATE, ...options, open: true });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result) => {
    setState((prev) => ({ ...prev, open: false }));
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <div
        className={`modal-overlay ${state.open ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) settle(false);
        }}
      >
        <div className="modal">
          <div className="flex items-center gap-4 mb-4">
            <i className={`fas ${VARIANT_ICONS[state.variant] ?? VARIANT_ICONS.success} text-[2.5rem]`} />
            <h3 className="text-[1.4rem] font-semibold m-0 max-[480px]:text-[1.2rem]">
              {state.title}
            </h3>
          </div>

          <p className="text-muted leading-relaxed mb-6">{state.message}</p>

          <div className="flex gap-4 justify-end max-[480px]:flex-col">
            <button
              type="button"
              className="btn btn-outline min-w-[100px] max-[480px]:w-full"
              onClick={() => settle(false)}
            >
              {state.cancelLabel}
            </button>
            <button
              type="button"
              className={`btn btn-primary min-w-[100px] max-[480px]:w-full ${
                state.variant === 'danger' ? '!bg-danger hover:!bg-danger/90' : ''
              }`}
              onClick={() => settle(true)}
            >
              {state.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
