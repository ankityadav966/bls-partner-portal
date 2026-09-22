import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Building,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { clientService } from '../../services/api';
import { Client } from '../../types';
import Button from '../../components/common/Button';
import AddClientModal from '../../components/forms/AddClientModal';

export const ClientsListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await clientService.getAll();
      if (res.data?.success) {
        setClients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.businessName && c.businessName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'ALL' || c.clientType === selectedType;

    return matchesSearch && matchesType;
  });

  const exportToCSV = () => {
    if (filteredClients.length === 0) return;
    const headers = ['Full Name', 'Business Name', 'Client Type', 'Phone', 'Email', 'City', 'Created Date'];
    const rows = filteredClients.map(c => [
      `"${c.fullName}"`,
      `"${c.businessName || ''}"`,
      `"${c.clientType}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.city}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BLS_Partner_Clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            Partner Client Directory
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Clients ({clients.length})</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly isolated records. Only clients enrolled under your Partner ID are visible.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={exportToCSV}
            disabled={filteredClients.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-4 h-4 text-amber-400" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Client
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, business, phone or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none placeholder-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="ALL">All Client Types</option>
            <option value="Individual">Individual</option>
            <option value="Proprietorship">Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="Private Limited">Private Limited</option>
            <option value="LLP">LLP</option>
            <option value="Trust / Society">Trust / Society</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchClients}
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
                <th className="py-3 px-4">Client Details</th>
                <th className="py-3 px-4">Entity / Business</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Enrolled On</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No clients match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{client.fullName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {client.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {client.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {client.businessName ? (
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{client.businessName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Individual Case</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]">
                        {client.clientType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{client.city}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(client.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/clients/${client._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                      >
                        Client 360° <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchClients}
      />
    </div>
  );
};

export default ClientsListPage;
