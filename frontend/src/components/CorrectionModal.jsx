import React, { useState } from 'react';
import { X, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../api/client';

const DISCREPANCY_TEMPLATES = [
  'Page 3 quarterly interest & bank charge summary is missing. Please provide the complete statement.',
  'GSTIN mismatch detected in line item 4. Place of supply does not match supplier master.',
  'TDS deduction schedule does not reconcile with Form 26AS records.',
  'Input Tax Credit claimed for row 12 is marked ineligible in GSTR-2B. Please clarify.',
  'Missing authorized signature and official seal on the commercial tax invoice.'
];

export default function CorrectionModal({ document, isOpen, onClose, onSuccess }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !document) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('A correction comment or reason is mandatory.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.reviews.correction(document._id, comment.trim());
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to request correction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-lg">Request Correction</h3>
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

          <div>
            <p className="text-xs text-slate-500 mb-2">
              Explain the audit discrepancy or missing information. The document will transition to{' '}
              <strong className="text-rose-700">CORRECTION_REQUIRED</strong>, and Staff will be notified to re-upload.
            </p>

            {/* Quick Templates */}
            <div className="mb-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Quick Discrepancy Templates:</span>
              </div>
              <div className="space-y-1">
                {DISCREPANCY_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setComment(tmpl)}
                    className="w-full text-left text-xs p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-slate-700 transition"
                  >
                    "{tmpl}"
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mandatory Audit Correction Note:
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Page 3 is missing, please re-upload with full statement..."
              className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              required
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
              disabled={loading || !comment.trim()}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Send Correction Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
