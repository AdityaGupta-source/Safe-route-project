export const RELATIONSHIP_COLORS = {
  Mother: '#ec4899',
  Father: '#3b82f6',
  Spouse: '#f59e0b',
  Sibling: '#8b5cf6',
  Friend: '#10b981',
  Colleague: '#6366f1',
  Other: '#64748b',
};

export default function ContactCard({ contact, onEdit, onDelete }) {
  // Relationship colour is data-driven, so it stays an inline style rather
  // than a Tailwind class (which must be statically analysable).
  const color = RELATIONSHIP_COLORS[contact.relationship] ?? RELATIONSHIP_COLORS.Other;

  return (
    <div className="glass p-5 mb-4 relative">
      <div className="flex gap-4 items-start">
        <div
          className="w-[50px] h-[50px] rounded-full flex items-center justify-center font-bold text-[1.2rem] shrink-0"
          style={{ background: color }}
        >
          {contact.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="m-0 mb-1 text-[1.1rem]">{contact.name}</h3>
              <span
                className="inline-block px-[0.6rem] py-[0.2rem] rounded-xl text-[0.75rem] font-medium"
                style={{ background: `${color}33`, color }}
              >
                {contact.relationship}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(contact)}
                title="Edit contact"
                aria-label={`Edit ${contact.name}`}
                className="bg-info/10 border border-info/30 text-info px-[0.8rem] py-[0.4rem] rounded-md text-[0.85rem] transition-colors duration-200 hover:bg-info/20"
              >
                <i className="fa-solid fa-pen" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(contact)}
                title="Delete contact"
                aria-label={`Delete ${contact.name}`}
                className="bg-danger/10 border border-danger/30 text-danger px-[0.8rem] py-[0.4rem] rounded-md text-[0.85rem] transition-colors duration-200 hover:bg-danger/20"
              >
                <i className="fa-solid fa-trash" />
              </button>
            </div>
          </div>

          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2 text-muted text-[0.95rem] mt-2"
          >
            <i className="fa-solid fa-phone text-primary" />
            {contact.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
