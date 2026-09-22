import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { PriorityLevel } from '../../types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ticketCategories = [
  'Service Processing Query',
  'Urgent Department Notice Escalation',
  'Document Verification / Deficiency',
  'Commercial / Payout Verification',
  'Technical Portal Assistance',
  'General Partner Policy Query'
];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [category, setCategory] = useState<string>(ticketCategories[0]);
  const [subject, setSubject] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [description, setDescription] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subject.trim() || !description.trim()) {
      setError('Please provide both a subject and full description.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/support-tickets', {
        category,
        subject,
        priority,
        description
      });

      if (res.data.success) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating support ticket.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Support Ticket"
      subtitle="Direct communication channel with BLS partner coordination and statutory desks."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Issue Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
            >
              {ticketCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Priority *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
            >
              <option value="LOW">Low (General Query)</option>
              <option value="MEDIUM">Medium (Standard Inquiry)</option>
              <option value="HIGH">High (Active Filing Deadline)</option>
              <option value="URGENT">Urgent (Statutory Scrutiny Date)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Subject Summary *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Need expedited review for Bank CMA Form II"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Detailed Query / Context *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Explain the specific issue, reference SRN, or departmental feedback..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            size="sm"
            isLoading={isLoading}
          >
            Submit Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTicketModal;
