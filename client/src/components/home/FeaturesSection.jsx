const FEATURES = [
  {
    icon: 'fa-lightbulb',
    title: 'Well-Lit Paths',
    text: "We prioritize streets with verified functional streetlights to ensure you're never walking in the dark.",
  },
  {
    icon: 'fa-road-spikes',
    title: 'Hazard Avoidance',
    text: 'Real-time updates on construction, open sewage, and broken roads help you steer clear of danger.',
  },
  {
    icon: 'fa-users-viewfinder',
    title: 'Crowd Sourced',
    text: 'Community reports keep the map updated instantly. Help others stay safe by reporting hazards.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="app-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 mt-16 py-16">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            data-anim="feature-card"
            className="glass p-8 max-[768px]:p-6 max-[480px]:p-5 text-left"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl mb-6">
              <i className={`fa-solid ${feature.icon}`} />
            </div>
            <h3 className="mb-4 text-[1.25rem] max-[480px]:text-[1.1rem]">{feature.title}</h3>
            <p className="text-muted text-[0.95rem] mb-2 max-[480px]:text-[0.85rem]">
              {feature.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
