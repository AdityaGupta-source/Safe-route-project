import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Hero from '../components/home/Hero';
import FeaturesSection from '../components/home/FeaturesSection';
import SplitSection from '../components/home/SplitSection';
import ReviewsSection from '../components/home/ReviewsSection';
import TransitionOverlay from '../components/home/TransitionOverlay';
import { useSidebar } from '../hooks/useSidebar';

import featureMap from '../assets/feature-map.png';
import community from '../assets/community.png';
import safeShop from '../assets/safe-shop.png';
import liveTracking from '../assets/live-tracking.png';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { to: '/#features', label: 'Features' },
  { to: '/#about', label: 'About' },
  { to: '/map', label: 'Map' },
];

export default function Home() {
  const sidebar = useSidebar();
  const navigate = useNavigate();
  const scope = useRef(null);
  const [transitioning, setTransitioning] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo('nav', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
        .fromTo(
          '[data-anim="hero-content"] > *',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' },
          '-=0.5',
        )
        .fromTo(
          '[data-anim="hero-img"]',
          { opacity: 0, scale: 1.05 },
          { opacity: 0.2, scale: 1, duration: 1.5, ease: 'power2.out' },
          '-=1.0',
        );

      gsap.from('[data-anim="feature-card"]', {
        scrollTrigger: { trigger: '#features', start: 'top 85%' },
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
      });

      gsap.from('[data-anim="about-card"]', {
        scrollTrigger: { trigger: '#about', start: 'top 85%' },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  const handleFindRoute = () => {
    setTransitioning(true);
    setTimeout(() => navigate('/map'), 1500);
  };

  return (
    <div ref={scope}>
      <Navbar onMenuClick={sidebar.toggle} variant="auth" links={NAV_LINKS} />
      <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close} showAuthLink />

      <Hero onFindRoute={handleFindRoute} />

      <FeaturesSection />

      <SplitSection
        id="how-it-works"
        image={featureMap}
        alt="Map Interface Preview"
        title="Smart Navigation"
        subtitle="See the safety score before you step out."
        text="Our advanced routing engine calculates a safety score for every possible route. Red zones indicate high-risk areas like construction sites or unlit alleys, while green paths guarantee verified street lighting and police presence."
      >
        <Link to="/map" className="btn btn-outline mt-5">
          Try the Map <i className="fa-solid fa-arrow-right" />
        </Link>
      </SplitSection>

      <SplitSection
        id="community"
        image={community}
        alt="Community Safety"
        title="Community Powered"
        subtitle="Safety in numbers."
        text="Join thousands of users who report real-time hazards. See a broken streetlight? Mark it. Noticed a safe open shop? Recommended it. Together, we build a safer city map for everyone."
        reverse
      >
        <div className="flex gap-[30px] mt-[30px] max-[768px]:justify-center">
          <div>
            <h4 className="text-[2rem] text-secondary">10k+</h4>
            <p className="text-[0.9rem] opacity-70">Active Users</p>
          </div>
          <div>
            <h4 className="text-[2rem] text-primary">500+</h4>
            <p className="text-[0.9rem] opacity-70">Hazards Fixed</p>
          </div>
        </div>
      </SplitSection>

      <SplitSection
        id="partners"
        image={safeShop}
        alt="Safe Shop Partner"
        title="Safe Zones"
        subtitle="Never feel stranded."
        text={`We've partnered with over 500 local businesses to create "Verified Safe Zones." Look for the green sticker on shop windows. These locations offer shelter, water, and emergency assistance if you ever feel unsafe.`}
      >
        <Link to="/map" className="btn btn-outline mt-5">
          View Safe Points
        </Link>
      </SplitSection>

      <SplitSection
        id="tracking"
        image={liveTracking}
        alt="Live Family Tracking"
        title="Peace of Mind"
        subtitle="Walk together, virtually."
        text="Share your live location with trusted contacts. If you deviate from the safe route or stop unexpectedly, our system automatically alerts your safety circle. You never have to walk alone again."
        reverse
      >
        <Link to="/contacts" className="btn btn-primary mt-5">
          Enable Tracking
        </Link>
      </SplitSection>

      <ReviewsSection />

      {/* About */}
      <section id="about" className="app-container mt-[50px] mb-[50px]">
        <div data-anim="about-card" className="glass p-10 max-[768px]:px-6 max-[480px]:px-4 max-[480px]:py-6 text-center">
          <h2 className="text-[2.5rem] max-[480px]:text-[1.75rem] mb-5 max-[480px]:mb-4 heading-gradient">
            Why Safe Route?
          </h2>
          <p className="text-muted text-[1.1rem] max-[480px]:text-[0.9rem] leading-[1.6] max-w-[800px] mx-auto">
            We built Safe Route because getting from point A to point B shouldn&apos;t be a risk.
            Whether you&apos;re walking home late at night or navigating a new city, standard maps
            only show you the fastest path—not the safest.
            <br />
            <br />
            Safe Route analyzes real-time data on street lighting, road conditions, and active
            construction zones to chart a course that prioritizes your wellbeing. It&apos;s not just
            a map; it&apos;s a companion that looks out for you.
          </p>
        </div>
      </section>

      <footer className="text-center p-5 text-muted text-[0.9rem] mt-[50px]">
        <p>&copy; 2024 Safe Route. All rights reserved.</p>
      </footer>

      <TransitionOverlay active={transitioning} />
    </div>
  );
}
