import PageLayout from '../components/layout/PageLayout';
import { useToast } from '../context/ToastContext';

export default function Sos() {
  const { showToast } = useToast();

  const handleActivate = () => {
    showToast(
      'error',
      'SOS Activated',
      'Your live location is being shared with your trusted contacts.',
      5000,
    );
  };

  return (
    <PageLayout glow="red" center>
      <h1 className="text-5xl mb-8 text-danger">EMERGENCY SOS</h1>

      <div className="glass p-12 max-[480px]:p-6 inline-block max-w-[500px] w-full">
        <div className="w-[150px] h-[150px] bg-danger/20 rounded-full mx-auto mb-8 flex items-center justify-center animate-sos-pulse">
          <i className="fa-solid fa-triangle-exclamation text-[4rem] text-danger" />
        </div>

        <h2 className="mb-4">Are you in trouble?</h2>
        <p className="text-muted mb-8">
          Pressing the button below will share your live location with your trusted contacts and
          emergency services.
        </p>

        <button
          type="button"
          onClick={handleActivate}
          className="btn bg-danger text-white text-[1.2rem] px-12 py-4 w-full hover:bg-danger/90"
        >
          ACTIVATE SOS
        </button>
      </div>
    </PageLayout>
  );
}
