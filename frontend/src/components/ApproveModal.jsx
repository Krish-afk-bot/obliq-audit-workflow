import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

export default function ApproveModal({ document, isOpen, onClose, onSuccess }) {
  const [note, setNote] = useState('Document verified against source vouchers and approved.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !document) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.reviews.approve(document._id, note);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-lg">Approve Audit Document</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
            Approving will transition <strong>{document.name} (v{document.currentVersion})</strong> into{' '}
            <span className="font-bold uppercase text-emerald-700">APPROVED</span> status. Once approved, the document is locked from further edits or re-uploads.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Approval Sign-off Note:
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Final Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
