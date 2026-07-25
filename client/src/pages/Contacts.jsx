import { useCallback, useEffect, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import ContactCard from '../components/contacts/ContactCard';
import ContactFormModal from '../components/contacts/ContactFormModal';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { getTrustedContacts, setTrustedContacts } from '../services/storage';

export default function Contacts() {
  const [contacts, setContacts] = useState(() => getTrustedContacts());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // localStorage stays in sync with state rather than being written at each call site.
  useEffect(() => {
    setTrustedContacts(contacts);
  }, [contacts]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (contact) => {
    setEditing(contact);
    setModalOpen(true);
  };

  const handleSave = useCallback(
    ({ name, phone, relationship }) => {
      if (!name || !phone || !relationship) {
        showToast('warning', 'Missing Information', 'Please fill in all required fields.', 3000);
        return;
      }

      if (editing) {
        setContacts((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, name, phone, relationship } : c)),
        );
        showToast('success', 'Contact Updated', `${name} has been updated successfully.`, 3000);
      } else {
        const newContact = {
          id: Date.now(),
          name,
          phone,
          relationship,
          createdAt: new Date().toISOString(),
        };
        setContacts((prev) => [newContact, ...prev]);
        showToast('success', 'Contact Added', `${name} has been added to your trusted contacts.`, 3000);
      }

      setModalOpen(false);
      setEditing(null);
    },
    [editing, showToast],
  );

  const handleDelete = useCallback(
    async (contact) => {
      const confirmed = await confirm({
        title: 'Delete Contact?',
        message: `Are you sure you want to remove "${contact.name}" from your trusted contacts? This action cannot be undone.`,
        variant: 'danger',
        confirmLabel: 'Delete',
      });

      if (!confirmed) return;

      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      showToast('success', 'Contact Deleted', `${contact.name} has been removed from your contacts.`, 3000);
    },
    [confirm, showToast],
  );

  return (
    <PageLayout title="Trusted Contacts">
      <div className="glass p-8">
        <div className="flex justify-between items-center mb-6 gap-4 max-[480px]:flex-col max-[480px]:items-stretch">
          <div>
            <h3 className="m-0">Manage Contacts</h3>
            <p className="text-muted mt-2 mb-0 text-[0.9rem]">
              Add people who should be notified in emergencies.
            </p>
          </div>
          <button type="button" onClick={openAdd} className="btn btn-primary shrink-0">
            <i className="fa-solid fa-plus" /> Add Contact
          </button>
        </div>

        {contacts.length === 0 ? (
          <div className="glass bg-white/[0.02] px-8 py-12 text-center">
            <i className="fa-solid fa-user-shield text-[4rem] text-muted mb-4 opacity-50" />
            <h3 className="mb-2">No Trusted Contacts Yet</h3>
            <p className="text-muted mb-6">Add your first emergency contact to get started.</p>
            <button type="button" onClick={openAdd} className="btn btn-primary">
              <i className="fa-solid fa-plus" /> Add Your First Contact
            </button>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <ContactFormModal
        open={modalOpen}
        contact={editing}
        onSave={handleSave}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />
    </PageLayout>
  );
}
