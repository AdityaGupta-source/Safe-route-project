import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const NAV_BTN = '!px-4 !py-[0.4rem] !text-[0.85rem]';

/**
 * Fixed top bar. `variant="auth"` shows Login/Register (landing page),
 * `variant="user"` shows the signed-in greeting used on interior pages.
 */
export default function Navbar({ onMenuClick, variant = 'user', links = [] }) {
  const navigate = useNavigate();

  // Preserves the original fade-out-then-navigate feel on the auth buttons.
  const handleAuthNav = (e, target) => {
    e.preventDefault();
    gsap.to(e.currentTarget, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    gsap.to('body', {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        navigate(target);
        gsap.to('body', { opacity: 1, duration: 0.4 });
      },
    });
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] py-4 max-[480px]:py-3 bg-dark transition-all duration-300">
      <div className="app-container flex justify-between items-center">
        <div className="flex items-center gap-[15px]">
          <button
            type="button"
            id="menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="bg-transparent text-white text-2xl max-[480px]:text-xl"
          >
            <i className="fa-solid fa-bars" />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 text-2xl md:text-2xl max-[768px]:text-xl max-[480px]:text-[1.1rem] font-bold font-heading text-light"
          >
            <i className="fa-solid fa-shield-halved text-secondary text-[1.75rem]" />
            <span>Safe Route</span>
          </Link>
        </div>

        {/* Desktop links - hidden below 769px, where the drawer takes over */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.label} to={link.to} className="nav-item">
              {link.label}
            </Link>
          ))}

          <div className="flex gap-4 items-center">
            {variant === 'auth' ? (
              <>
                <a
                  href="/login"
                  onClick={(e) => handleAuthNav(e, '/login')}
                  className={`btn btn-outline ${NAV_BTN}`}
                >
                  Login
                </a>
                <a
                  href="/register"
                  onClick={(e) => handleAuthNav(e, '/register')}
                  className={`btn btn-primary ${NAV_BTN}`}
                >
                  Register
                </a>
              </>
            ) : (
              <div className="flex items-center gap-2.5 text-white">
                <span className="font-bold">Hello, User</span>
                <div className="w-[35px] h-[35px] bg-primary rounded-full flex items-center justify-center">
                  U
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
