/** Renders 5 stars from a rating that may include a .5 (half-star). */
function Stars({ rating }) {
  return (
    <div className="text-star mb-4 text-[0.9rem] max-[480px]:text-[0.85rem] max-[480px]:mb-[0.85rem]">
      {Array.from({ length: 5 }, (_, i) => {
        const position = i + 1;
        if (rating >= position) return <i key={i} className="fa-solid fa-star" />;
        if (rating >= position - 0.5) return <i key={i} className="fa-solid fa-star-half-stroke" />;
        return <i key={i} className="fa-regular fa-star" />;
      })}
    </div>
  );
}

export default function ReviewCard({ review, ...rest }) {
  return (
    <div
      {...rest}
      className="glass shrink-0 grow-0 basis-auto min-w-[85%] sm:min-w-[31%] md:min-w-[18.8%] max-w-[400px] p-6 max-[768px]:px-5 max-[768px]:py-6 flex flex-col justify-between snap-start box-border"
    >
      <Stars rating={review.rating} />

      <p className="text-[0.95rem] leading-[1.6] mb-6 italic text-light max-[480px]:text-[0.9rem] max-[480px]:leading-[1.5] max-[480px]:mb-5">
        &quot;{review.text}&quot;
      </p>

      <div className="flex items-center gap-2.5 max-[480px]:gap-2">
        <div
          className="w-[35px] h-[35px] max-[480px]:w-8 max-[480px]:h-8 rounded-full flex items-center justify-center text-[0.8rem] max-[480px]:text-xs font-bold text-white shrink-0"
          style={{ background: review.color }}
        >
          {review.initials}
        </div>
        <span className="text-[0.85rem] sm:text-base">{review.name}</span>
      </div>
    </div>
  );
}
