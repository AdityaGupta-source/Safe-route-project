import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSidebar } from '../../hooks/useSidebar';

const DEFAULT_LINKS = [
  { to: '/#features', label: 'Features' },
  { to: '/#about', label: 'About' },
  { to: '/map', label: 'Map' },
];

const GLOWS = {
  indigo: 'bg-hero-glow',
  red: 'bg-sos-glow',
};

/**
 * Standard chrome for every interior page: fixed navbar, slide-out drawer,
 * and the gradient content well with an optional gradient page title.
 */
export default function PageLayout({ title, glow = 'indigo', center = false, children }) {
  const sidebar = useSidebar();

  return (
    <>
      <Navbar onMenuClick={sidebar.toggle} links={DEFAULT_LINKS} />
      <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close} />

      <div className={`pt-[100px] pb-[50px] min-h-screen ${GLOWS[glow]}`}>
        <div className={`app-container ${center ? 'text-center' : ''}`}>
          {title ? (
            <h1 className="text-[2.5rem] mb-8 heading-gradient">{title}</h1>
          ) : null}
          {children}
        </div>
      </div>
    </>
  );
}
