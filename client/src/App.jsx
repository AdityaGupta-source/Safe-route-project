import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import ScrollManager from './components/layout/ScrollManager';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <ScrollManager />
        <AppRoutes />
      </ConfirmProvider>
    </ToastProvider>
  );
}
