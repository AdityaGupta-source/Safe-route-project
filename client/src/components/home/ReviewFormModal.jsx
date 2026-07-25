import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/** "Write a review" dialog: star picker + free text, animated like the original. */
export default function ReviewFormModal({ open, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setRating(0);
      setText('');
    }
  }, [open]);

  useEffect(() => {
    if (!mounted || !panelRef.current) return undefined;
    const panel = panelRef.current;

    if (open) {
      gsap.fromTo(
        panel,
        { opacity: 0, xPercent: -50, yPercent: -40, scale: 0.95 },
        { opacity: 1, xPercent: -50, yPercent: -50, scale: 1, duration: 0.3, ease: 'back.out(1.7)' },
      );
      return undefined;
    }

    const tween = gsap.to(panel, {
      opacity: 0,
      xPercent: -50,
      yPercent: -40,
      scale: 0.95,
      duration: 0.2,
      onComplete: () => setMounted(false),
    });

    return () => tween.kill();
  }, [open, mounted]);

  const handlePost = () => {
    if (!text.trim() || rating === 0) {
      alert('Please write a review and select a rating.');
      return;
    }
    onSubmit({ rating, text: text.trim() });
  };

  if (!mounted) return null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-[2000] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        ref={panelRef}
        className="fixed top-1/2 left-1/2 z-[2001] w-[90%] max-[480px]:w-[95%] max-w-[500px] p-8 max-[480px]:p-6 rounded-2xl border border-white/20 shadow-popup bg-[rgba(17,24,39,0.95)] backdrop-blur-[10px]"
      >
        <div className="flex justify-between items-center mb-5">
          <h4 className="m-0 text-[1.2rem]">Share your experience</h4>
          <i
            onClick={onClose}
            className="fa-solid fa-xmark cursor-pointer text-[1.2rem] text-muted transition-colors duration-200 hover:text-white"
          />
        </div>

        <div className="flex gap-2.5 mb-5 text-star text-2xl max-[480px]:text-[1.75rem] cursor-pointer justify-center">
          {[1, 2, 3, 4, 5].map((value) => (
            <i
              key={value}
              onClick={() => setRating(value)}
              className={value <= rating ? 'fa-solid fa-star' : 'fa-regular fa-star'}
            />
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your Review"
          rows={4}
          className="w-full p-3 mb-5 rounded-lg bg-white/5 border border-white/20 text-white font-body max-[480px]:text-[0.9rem] max-[480px]:min-h-[100px] focus:outline-none focus:border-primary"
        />

        <button type="button" onClick={handlePost} className="btn btn-primary w-full">
          Post Review
        </button>
      </div>
    </>
  );
}
