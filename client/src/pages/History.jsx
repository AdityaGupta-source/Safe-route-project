import PageLayout from '../components/layout/PageLayout';

export default function History() {
  return (
    <PageLayout title="Ride History">
      <div className="glass p-8 text-center">
        <i className="fa-solid fa-clock-rotate-left text-5xl text-muted mb-4" />
        <h3 className="mb-4">Past Rides &amp; Routes</h3>
        <p className="text-muted">
          Your recent travel history will appear here. This feature is coming soon.
        </p>
      </div>
    </PageLayout>
  );
}
