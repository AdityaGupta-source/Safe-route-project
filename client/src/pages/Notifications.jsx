import PageLayout from '../components/layout/PageLayout';

const NOTIFICATIONS = [
  {
    id: 1,
    dotClass: 'bg-danger',
    title: 'Hazard Alert',
    message: 'A new hazard was reported near your location.',
  },
  {
    id: 2,
    dotClass: 'bg-primary',
    title: 'Welcome to Safe Route',
    message: 'Thank you for joining our community!',
  },
];

export default function Notifications() {
  return (
    <PageLayout title="Notifications">
      <div className="glass p-8">
        {NOTIFICATIONS.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 flex items-center gap-4 ${
              index < NOTIFICATIONS.length - 1 ? 'border-b border-white/10' : ''
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotClass}`} />
            <div>
              <strong>{item.title}</strong>
              <div className="text-[0.9rem] text-muted">{item.message}</div>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
