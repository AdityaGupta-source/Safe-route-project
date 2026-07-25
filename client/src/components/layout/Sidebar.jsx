import { Link, NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from '../../data/navigation';

/**
 * Slide-out drawer shared by every page. Rendered off-canvas and translated in,
 * matching the original `left: -300px` -> `left: 0` transition.
 */
export default function Sidebar({ isOpen, onClose, showAuthLink = false }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-[1001] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`glass fixed top-0 h-screen w-[280px] max-[480px]:w-[85%] z-[1002] p-8 max-[480px]:p-6 flex flex-col gap-6 transition-[left] duration-[400ms] ease-in-out border-r border-l-0 rounded-none overflow-y-auto ${
          isOpen ? 'left-0' : 'left-[-300px] max-[480px]:left-[-85%]'
        }`}
      >
        <div className="flex justify-between items-center">
          <Link to="/" onClick={onClose} className="flex items-center gap-2 text-2xl font-bold font-heading text-light">
            <i className="fa-solid fa-shield-halved text-secondary" /> Safe Route
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="bg-transparent text-white text-2xl"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* User stub */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">U</div>
          <div>
            <div className="font-bold">User Name</div>
            <Link to="/profile" onClick={onClose} className="text-[0.8rem] text-muted block">
              View Profile
            </Link>
          </div>
        </div>

        <nav className="flex flex-col gap-4 text-base">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="flex flex-col gap-4">
              <div className="text-xs uppercase text-muted opacity-70 tracking-[1px] mt-2.5 first:mt-0">
                {section.label}
              </div>

              {section.items.map((item) =>
                item.hash ? (
                  <Link key={item.label} to={item.to} onClick={onClose} className="nav-item">
                    <i className={`fa-solid ${item.icon} w-[25px]`} /> {item.label}
                  </Link>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'text-primary' : ''} ${
                        item.danger && !isActive ? 'text-danger' : ''
                      }`
                    }
                  >
                    <i className={`fa-solid ${item.icon} w-[25px]`} /> {item.label}
                    {item.badge ? (
                      <span className="bg-danger text-white text-[0.7rem] px-1.5 py-0.5 rounded-[10px] ml-1.5">
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                ),
              )}
            </div>
          ))}

          <hr className="border-white/10 my-2" />

          {showAuthLink ? (
            <Link to="/login" onClick={onClose} className="btn btn-outline">
              Login
            </Link>
          ) : (
            <Link to="/" onClick={onClose} className="btn btn-outline">
              Logout
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
