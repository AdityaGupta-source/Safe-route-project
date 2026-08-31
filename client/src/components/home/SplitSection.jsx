/**
 * The alternating image/content rows used by the How It Works, Community,
 * Safe Zones and Tracking sections. `reverse` puts the image on the right.
 */
export default function SplitSection({ id, image, alt, title, subtitle, text, reverse = false, children }) {
  const media = (
    <div className="glass flex-1 overflow-hidden p-2.5 transition-transform duration-500 hover:-translate-y-[5px]">
      <img
        src={image}
        alt={alt}
        width={900}
        height={900}
        loading="lazy"
        decoding="async"
        className="w-full h-auto rounded-[0.8rem] block"
      />
    </div>
  );

  const content = (
    <div className="flex-1">
      <h2 className="section-title">{title}</h2>
      <h3 className="section-subtitle">{subtitle}</h3>
      <p className="section-text">{text}</p>
      {children}
    </div>
  );

  return (
    <section id={id} className="app-container mt-[100px]">
      <div className="flex items-center gap-8 md:gap-16 py-8 max-[768px]:flex-col max-[768px]:text-center">
        {reverse ? (
          <>
            {content}
            {media}
          </>
        ) : (
          <>
            {media}
            {content}
          </>
        )}
      </div>
    </section>
  );
}
