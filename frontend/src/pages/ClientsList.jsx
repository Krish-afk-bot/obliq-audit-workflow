import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Building,
  FileSpreadsheet
} from 'lucide-react';

export default function ClientsList() {
  const { isStaff, user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [financialYear, setFinancialYear] = useState('FY 2024-25');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.clients.list();
      setClients(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      setModalError('Client name is required');
      return;
    }

    setCreating(true);
    setModalError('');

    try {
      await api.clients.create({
        name: newClientName.trim(),
        pan: newPan.trim().toUpperCase(),
        gstin: newGstin.trim().toUpperCase(),
        financialYear
      });
      setModalOpen(false);
      setNewClientName('');
      setNewPan('');
      setNewGstin('');
      fetchClients();
    } catch (err) {
      setModalError(err.message || 'Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Loading firm clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Client Portfolios</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage audit documents, review states, and compliance history
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="font-bold text-slate-800 text-base">No Clients Registered Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create your first client portfolio. 5 mandatory audit documents will automatically be initialized.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Client</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => {
            const stats = client.stats || { total: 5, approved: 0 };
            const progressPercent = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

            return (
              <div
                key={client._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-bold text-xs">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                        <span className="text-[11px] text-slate-400">{client.financialYear}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    {client.pan && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        PAN: {client.pan}
                      </span>
                    )}
                    {client.gstin && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        GST: {client.gstin}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Audit Completion</span>
                      <span className="font-semibold text-slate-700">
                        {stats.approved} / {stats.total} Approved ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Created by {client.createdBy?.name || 'Staff'}
                  </span>
                  <Link
                    to={`/clients/${client._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Register New Client Portfolio</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Business Name *
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. ABC Traders Pvt. Ltd."
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Permanent Account No (PAN)
                  </label>
                  <input
                    type="text"
                    value={newPan}
                    onChange={(e) => setNewPan(e.target.value)}
                    placeholder="AABCA1234F"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    placeholder="27AABCA1234F1Z5"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financial Year
                </label>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="FY 2024-25">FY 2024-25</option>
                  <option value="FY 2023-24">FY 2023-24</option>
                  <option value="FY 2022-23">FY 2022-23</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-700">Automatic Initialization:</div>
                <p>
                  5 mandatory audit documents (Bank Statement, Sales Register, Purchase Register, GST Return, Expense Summary) will be provisioned in <strong>PENDING</strong> state.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2"
                >
                  {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Register Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
