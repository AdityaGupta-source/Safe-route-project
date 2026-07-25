import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import GsapModal from '../components/ui/GsapModal';
import { useToast } from '../context/ToastContext';
import { RECENT_ROUTES, FULL_HISTORY } from '../data/rideHistory';

const FIELD_CLASS =
  'w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white font-body focus:outline-none focus:border-primary';

const STATS = [
  { icon: 'fa-person-walking', color: 'text-secondary', value: '42 km', label: 'Safe Distance' },
  { icon: 'fa-triangle-exclamation', color: 'text-warning', value: '12', label: 'Hazards Reported' },
  { icon: 'fa-shield-heart', color: 'text-primary', value: '98%', label: 'Safety Score' },
];

function RouteRow({ item }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg gap-3">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 ${
            item.safe ? 'text-primary' : 'text-warning'
          }`}
        >
          <i className="fa-solid fa-location-dot" />
        </div>
        <div className="min-w-0">
          <div className="font-bold mb-1 truncate">{item.dest}</div>
          <div className="text-[0.85rem] text-muted">
            {item.time} • {item.dist}
          </div>
        </div>
      </div>

      <div
        className={`text-[0.9rem] flex items-center gap-1.5 shrink-0 ${
          item.safe ? 'text-secondary' : 'text-warning'
        }`}
      >
        <i className={`fa-solid ${item.safe ? 'fa-check' : 'fa-triangle-exclamation'}`} />
        <span className="hidden sm:inline">{item.safe ? 'Safe' : 'Hazards Detected'}</span>
      </div>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState({ name: 'User Name', email: 'user@example.com' });
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [draft, setDraft] = useState(user);

  const { showToast } = useToast();

  useEffect(() => {
    if (editOpen) setDraft(user);
  }, [editOpen, user]);

  const handleSave = () => {
    setUser({
      name: draft.name.trim() || user.name,
      email: draft.email.trim() || user.email,
    });
    setEditOpen(false);
    showToast('success', 'Profile Updated', 'Your profile changes have been saved.', 3000);
  };

  const handleChangePassword = () => {
    showToast('info', 'Change Password', 'Password management will arrive with the backend.', 3000);
  };

  return (
    <PageLayout title="My Profile">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
        {/* Left: identity card */}
        <div className="glass p-8 text-center h-fit">
          <div className="w-[100px] h-[100px] bg-primary rounded-full mx-auto mb-6 flex items-center justify-center text-[2.5rem] font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mb-2 text-2xl">{user.name}</h2>
          <p className="text-muted mb-6">{user.email}</p>

          <div className="inline-block px-4 py-2 bg-secondary/20 text-secondary rounded-[20px] text-[0.9rem] mb-8">
            <i className="fa-solid fa-circle-check" /> Verified Citizen
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="btn btn-outline w-full mb-4"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={handleChangePassword}
            className="btn btn-outline w-full !border-white/10"
          >
            Change Password
          </button>
        </div>

        {/* Right: stats + recent activity */}
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass p-6 text-center">
                <i className={`fa-solid ${stat.icon} text-[2rem] ${stat.color} mb-4`} />
                <h3 className="text-[1.8rem] mb-1">{stat.value}</h3>
                <p className="text-[0.9rem] text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="glass p-8">
            <h3 className="mb-6 border-b border-white/10 pb-4">Recent Safe Routes</h3>

            <div className="flex flex-col gap-4">
              {RECENT_ROUTES.map((item) => (
                <RouteRow key={item.id} item={item} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="btn btn-outline w-full mt-6"
            >
              View Full History
            </button>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <GsapModal open={editOpen} onClose={() => setEditOpen(false)} className="max-w-[500px]">
        <h2 className="mb-6 text-[1.75rem]">Edit Profile</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="edit-name" className="block mb-2 text-[0.9rem]">
              Full Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter your name"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="edit-email" className="block mb-2 text-[0.9rem]">
              Email Address
            </label>
            <input
              id="edit-email"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
              placeholder="Enter your email"
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button type="button" onClick={() => setEditOpen(false)} className="btn btn-outline flex-1">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn btn-primary flex-1">
            Save Changes
          </button>
        </div>
      </GsapModal>

      {/* Full history */}
      <GsapModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        className="max-w-[700px] max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[1.75rem]">Full Route History</h2>
          <button
            type="button"
            onClick={() => setHistoryOpen(false)}
            aria-label="Close history"
            className="bg-transparent text-white text-2xl"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {FULL_HISTORY.map((item) => (
            <RouteRow key={item.id} item={item} />
          ))}
        </div>

        <Link to="/history" className="btn btn-outline w-full mt-6">
          Open Ride History
        </Link>
      </GsapModal>
    </PageLayout>
  );
}
