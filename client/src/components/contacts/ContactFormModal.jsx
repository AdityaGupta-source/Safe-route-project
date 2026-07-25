import { useEffect, useState } from 'react';

const RELATIONSHIPS = ['Mother', 'Father', 'Spouse', 'Sibling', 'Friend', 'Colleague', 'Other'];

const EMPTY = { name: '', phone: '', relationship: '' };

const FIELD_CLASS =
  'w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-base focus:outline-none focus:border-primary';

/** Add/edit dialog for a trusted contact. `contact` non-null puts it in edit mode. */
export default function ContactFormModal({ open, contact, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  // Re-seed the fields whenever the dialog opens for a different contact.
  useEffect(() => {
    if (!open) return;
    setForm(
      contact
        ? { name: contact.name, phone: contact.phone, relationship: contact.relationship }
        : EMPTY,
    );
  }, [open, contact]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      relationship: form.relationship,
    });
  };

  return (
    <div
      className={`modal-overlay ${open ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal !max-w-[500px]">
        <div className="flex items-center gap-4 mb-4">
          <i className="fas fa-user-plus text-secondary text-[2.5rem]" />
          <h3 className="text-[1.4rem] font-semibold m-0 max-[480px]:text-[1.2rem]">
            {contact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="contact-name" className="block mb-2 font-medium">
              Name *
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={form.name}
              onChange={update('name')}
              placeholder="e.g., John Doe"
              className={FIELD_CLASS}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="contact-phone" className="block mb-2 font-medium">
              Phone Number *
            </label>
            <input
              id="contact-phone"
              type="tel"
              required
              value={form.phone}
              onChange={update('phone')}
              placeholder="e.g., +1 234 567 890"
              className={FIELD_CLASS}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="contact-relationship" className="block mb-2 font-medium">
              Relationship *
            </label>
            <select
              id="contact-relationship"
              required
              value={form.relationship}
              onChange={update('relationship')}
              className={FIELD_CLASS}
            >
              <option value="" className="bg-dark">
                Select relationship
              </option>
              {RELATIONSHIPS.map((rel) => (
                <option key={rel} value={rel} className="bg-dark">
                  {rel}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 justify-end max-[480px]:flex-col">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline min-w-[100px] max-[480px]:w-full"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary min-w-[100px] max-[480px]:w-full">
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
