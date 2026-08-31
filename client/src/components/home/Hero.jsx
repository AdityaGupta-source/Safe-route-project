import RoutePlanner from './RoutePlanner';
import heroImage from '../../assets/hero-safe-route.webp';

export default function Hero({ onFindRoute }) {
  return (
    <section className="h-screen flex items-center justify-center relative bg-hero-glow overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16 md:pt-20 md:pb-0">
      {/* Ambient blobs */}
      <div className="absolute rounded-full blur-[80px] opacity-40 z-0 w-[400px] h-[400px] bg-primary top-[-100px] left-[-100px]" />
      <div className="absolute rounded-full blur-[80px] opacity-40 z-0 w-[300px] h-[300px] bg-secondary bottom-[-50px] right-[-50px]" />

      <img
        src={heroImage}
        alt="Safe Route Map"
        data-anim="hero-img"
        width={720}
        height={720}
        fetchpriority="high"
        decoding="async"
        className="absolute right-[-10%] top-1/2 opacity-20 z-[1] pointer-events-none w-[60%] mix-blend-lighten"
        style={{ transform: 'translateY(-50%) perspective(1000px) rotateY(-20deg) rotateX(10deg)' }}
      />

      <div data-anim="hero-content" className="relative z-10 text-center max-w-[800px] px-4">
        <h1 className="heading-gradient leading-[1.1] mb-3 sm:mb-6 text-[1.5rem] xs:text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[4rem]">
          Don&apos;t just get there.
          <br />
          Get there safely.
        </h1>

        <p className="text-muted mb-6 sm:mb-12 text-[0.9rem] sm:text-base md:text-[1.25rem]">
          Avoid unlit streets, construction zones, and hazardous areas. The smartest navigation for
          your safety.
        </p>

        <RoutePlanner onFindRoute={onFindRoute} />
      </div>
    </section>
  );
}
