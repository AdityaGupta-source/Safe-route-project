import { useRef, useState } from 'react';
import ReviewCard from './ReviewCard';
import ReviewFormModal from './ReviewFormModal';
import { REVIEWS } from '../../data/reviews';
import { useToast } from '../../context/ToastContext';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState(REVIEWS);
  const [formOpen, setFormOpen] = useState(false);
  const trackRef = useRef(null);
  const { showToast } = useToast();

  // Scroll by exactly one card + gap, so cards always land on a snap point.
  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector('[data-review-card]');
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    const amount = card ? card.offsetWidth + gap : 300;

    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  const handleSubmit = ({ rating, text }) => {
    setReviews((prev) => [
      { id: Date.now(), rating, text, name: 'You', initials: 'YO', color: '#4F46E5' },
      ...prev,
    ]);
    setFormOpen(false);
    showToast('success', 'Review Posted', 'Thanks for sharing your experience!', 3000);
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  return (
    <section id="reviews" className="app-container mt-[100px] mb-[100px] overflow-hidden">
      <div className="text-center mb-[50px]">
        <h2 className="section-title">Testimonials</h2>
        <h3 className="section-subtitle !text-[2rem]">What our users say</h3>

        <div className="flex justify-center gap-5 mt-5 max-[768px]:mt-6">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous reviews"
            className="w-10 h-10 max-[768px]:w-[38px] max-[768px]:h-[38px] rounded-full border border-white/20 bg-white/5 text-light flex items-center justify-center transition-colors duration-200 hover:bg-primary hover:border-primary"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next reviews"
            className="w-10 h-10 max-[768px]:w-[38px] max-[768px]:h-[38px] rounded-full border border-white/20 bg-white/5 text-light flex items-center justify-center transition-colors duration-200 hover:bg-primary hover:border-primary"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>

        <button type="button" onClick={() => setFormOpen(true)} className="btn btn-outline mt-5">
          <i className="fa-solid fa-pen" /> Write a Review
        </button>
      </div>

      <div className="relative px-10 overflow-hidden">
        <div
          ref={trackRef}
          className="no-scrollbar flex gap-[1.5%] overflow-x-auto scroll-smooth py-5 snap-x snap-mandatory"
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} data-review-card="" />
          ))}
        </div>
      </div>

      <ReviewFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
