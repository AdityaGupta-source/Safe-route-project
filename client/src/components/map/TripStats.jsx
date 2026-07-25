const STAT_VALUE =
  'text-2xl font-bold font-heading text-secondary max-[768px]:text-[1.25rem] max-[480px]:text-[1.1rem] max-[360px]:text-base';
const STAT_LABEL =
  'text-xs uppercase tracking-[0.05em] text-muted max-[768px]:text-[0.7rem] max-[480px]:text-[0.65rem] max-[360px]:text-[0.6rem]';

export default function TripStats({ time, safety, distance }) {
  const stats = [
    { value: time, label: 'Est. Time' },
    { value: safety, label: 'Safety Score' },
    { value: distance, label: 'Distance' },
  ];

  return (
    <div className="glass absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-[600px] flex justify-between items-center px-8 py-4 max-[1024px]:max-w-[500px] max-[1024px]:px-6 max-[768px]:w-[95%] max-[768px]:px-5 max-[768px]:py-[0.85rem] max-[768px]:bottom-2.5 max-[480px]:w-[calc(100%-20px)] max-[480px]:px-4 max-[480px]:py-3 max-[480px]:justify-around max-[480px]:gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center max-[480px]:flex-1">
          <div className={STAT_VALUE}>{stat.value}</div>
          <div className={STAT_LABEL}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
