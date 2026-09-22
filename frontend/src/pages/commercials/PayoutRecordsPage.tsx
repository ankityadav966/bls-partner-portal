import React, { useEffect, useState } from 'react';
import {
  Coins,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  AlertCircle,
  RefreshCw,
  Building,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { commercialService } from '../../services/api';
import { CommercialRecord } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';

export const PayoutRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<CommercialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await commercialService.getAll();
      if (res.data?.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load commercial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const totalSettled = records
    .filter(r => r.status === 'Settled')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPending = records
    .filter(r => r.status === 'Pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalProcessing = records
    .filter(r => r.status === 'Processing')
    .reduce((sum, r) => sum + r.amount, 0);

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Record ID', 'Service Request ID', 'Service Name', 'Amount (INR)', 'Settlement Status', 'Settlement Date', 'Transaction Reference'];
    const rows = records.map(r => [
      `"${r._id}"`,
      `"${r.requestId}"`,
      `"${r.serviceName}"`,
      `"${r.amount}"`,
      `"${r.status}"`,
      `"${r.settlementDate || 'N/A'}"`,
      `"${r.transactionRef || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BLS_Partner_Commercials_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            Commercial & Settlement Statements
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Partner Commercials</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified financial ledger for services filed through your partner account.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={exportCSV}
            disabled={records.length === 0}
          >
            Export Ledger CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchRecords}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Settled Payouts"
          value={`₹${totalSettled.toLocaleString('en-IN')}`}
          subtitle="Credited to registered partner bank"
          icon={<CheckCircle2 className="w-4 h-4" />}
          variant="success"
        />
        <StatCard
          title="Under Processing"
          value={`₹${totalProcessing.toLocaleString('en-IN')}`}
          subtitle="Queued in current payout cycle"
          icon={<Clock className="w-4 h-4" />}
          variant="warning"
        />
        <StatCard
          title="Pending Approval"
          value={`₹${totalPending.toLocaleString('en-IN')}`}
          subtitle="Awaiting final case sign-off"
          icon={<Receipt className="w-4 h-4" />}
          variant="gold"
        />
      </div>

      {/* Policy Notice */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-900 font-bold block mb-0.5">Commercial Settlement Protocol</span>
          All partner commercial shares are strictly reconciled upon completion and client sign-off of the respective service request. Remittances are made directly via NEFT/RTGS to the verified firm bank account on the 5th and 20th of every month.
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
                <th className="py-3 px-4">Service Request ID</th>
                <th className="py-3 px-4">Service Description</th>
                <th className="py-3 px-4">Commercial Share</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Settlement Date</th>
                <th className="py-3 px-4 text-right">Bank / UTR Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No commercial records available yet.
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {rec.requestId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {rec.serviceName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700 text-sm">
                      ₹{rec.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {rec.settlementDate ? new Date(rec.settlementDate).toLocaleDateString('en-IN') : 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {rec.transactionRef || <span className="text-slate-400 italic">Not Generated</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayoutRecordsPage;
