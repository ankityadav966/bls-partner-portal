import React, { useEffect, useState } from 'react';
import {
  Headphones,
  PlusCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Send,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { supportService } from '../../services/api';
import { SupportTicket } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import CreateTicketModal from '../../components/forms/CreateTicketModal';
import Modal from '../../components/common/Modal';

export const SupportTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Selected ticket for viewing thread
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await supportService.getAll();
      if (res.data?.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load partner support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Headphones className="w-4 h-4" />
            Partner Priority Helpdesk
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets ({tickets.length})</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct operational escalation channel to Senior CAs and ROC specialists.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4 text-amber-400" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Create New Ticket
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchTickets}
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Subject & Scope</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Replies</th>
                <th className="py-3 px-4">Raised On</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No support tickets submitted yet. Everything looks good!
                  </td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      {ticket.ticketId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 max-w-[280px] truncate">
                        {ticket.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[320px] mt-0.5">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium border border-slate-200">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ticket.replies?.length || 0}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        View Thread
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Conversation Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketId} — ${selectedTicket.subject}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">
                Category: <strong className="text-slate-900">{selectedTicket.category}</strong>
              </span>
              <StatusBadge status={selectedTicket.status} />
            </div>

            {/* Initial description */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <div className="font-semibold text-amber-800 text-[11px] mb-1">
                Original Message (Partner):
              </div>
              <p className="text-slate-700 leading-relaxed">{selectedTicket.description}</p>
            </div>

            {/* Conversation Replies Thread */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Support Conversation ({selectedTicket.replies?.length || 0})
              </h4>

              {(!selectedTicket.replies || selectedTicket.replies.length === 0) ? (
                <div className="p-4 rounded-lg bg-slate-50 text-slate-500 text-center italic border border-slate-100">
                  Awaiting review by BLS Help Desk coordinator. Expected response within 2 hours.
                </div>
              ) : (
                selectedTicket.replies.map(rep => (
                  <div
                    key={rep._id}
                    className={`p-3.5 rounded-lg border ${
                      rep.senderRole === 'admin'
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[11px]">
                      <span className="font-bold text-slate-900">
                        {rep.senderName} ({rep.senderRole === 'admin' ? 'BLS Team' : 'You'})
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(rep.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="leading-relaxed">{rep.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTickets}
      />
    </div>
  );
};

export default SupportTicketsPage;
