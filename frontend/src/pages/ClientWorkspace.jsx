import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Building,
  UploadCloud,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  Clock,
  Sparkles
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UploadModal from '../components/UploadModal';
import AuditTimeline from '../components/AuditTimeline';

export default function ClientWorkspace() {
  const { clientId } = useParams();
  const { isStaff, isReviewer } = useAuth();
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'audit'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload modal state
  const [selectedDocForUpload, setSelectedDocForUpload] = useState(null);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const res = await api.clients.get(clientId);
      setClient(res.data);
      setDocuments(res.data.documents || []);

      const auditRes = await api.clients.getAuditHistory(clientId);
      setAuditEvents(auditRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load client workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Opening client workspace...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Access Denied or Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {error || 'This client either does not exist or belongs to another firm. Strict tenant isolation prevented access.'}
          </p>
        </div>
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Client List</span>
        </Link>
      </div>
    );
  }

  const approvedCount = documents.filter((d) => d.status === 'APPROVED').length;
  const progressPercent = documents.length > 0 ? Math.round((approvedCount / documents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back Button & Client Header */}
      <div>
        <Link
          to="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Clients</span>
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {client.name}
                </h1>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {client.financialYear}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {client.pan && <span>PAN: <strong className="font-mono text-slate-700">{client.pan}</strong></span>}
                {client.gstin && <span>GSTIN: <strong className="font-mono text-slate-700">{client.gstin}</strong></span>}
                <span>Created by: <strong className="text-slate-700">{client.createdBy?.name || 'Staff'}</strong></span>
              </div>
            </div>

            {/* Audit Progress Meter */}
            <div className="md:text-right space-y-1 shrink-0">
              <div className="text-xs font-semibold text-slate-600">
                Audit Clearance: <span className="text-teal-700 font-bold">{approvedCount} of {documents.length} Completed</span>
              </div>
              <div className="w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-2 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Required Audit Documents ({documents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-2 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Full Client Audit Trail ({auditEvents.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Statutory & Financial Document Schedule
            </h2>
            <span className="text-xs text-slate-500">
              Follows: Upload → Review → Correction / Approval
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const isPending = doc.status === 'PENDING';
                const isUploaded = doc.status === 'UPLOADED';
                const isUnderReview = doc.status === 'UNDER_REVIEW';
                const isCorrection = doc.status === 'CORRECTION_REQUIRED';
                const isApproved = doc.status === 'APPROVED';

                return (
                  <div
                    key={doc._id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-slate-900">{doc.name}</span>
                        <StatusBadge status={doc.status} />
                        {doc.currentVersion > 0 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded">
                            v{doc.currentVersion}
                          </span>
                        )}
                      </div>

                      {doc.latestCorrectionComment && isCorrection && (
                        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                          <span className="font-bold">Correction Note:</span>{' '}
                          <span className="italic">"{doc.latestCorrectionComment}"</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Upload button for Staff/Reviewer if Pending */}
                      {isPending && (
                        <button
                          onClick={() => setSelectedDocForUpload(doc)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                        </button>
                      )}

                      {/* Re-upload button if Correction Required */}
                      {isCorrection && (
                        <button
                          onClick={() => setSelectedDocForUpload(doc)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-upload Corrected (v{doc.currentVersion + 1})</span>
                        </button>
                      )}

                      {/* Review Workspace Link */}
                      {!isPending && (
                        <Link
                          to={`/documents/${doc._id}/review`}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-lg text-xs font-semibold transition shadow-2xs ${
                            isUploaded && isReviewer
                              ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isApproved ? 'View Certified Document' : 'Open Review Panel'}</span>
                        </Link>
                      )}

                      {/* View Audit Trail Link */}
                      <Link
                        to={`/documents/${doc._id}/review#history`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-medium transition border border-slate-200"
                        title="View Append-Only Audit History"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>History</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Append-Only Client Audit Event Stream
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Immutable Traceability Record
            </span>
          </div>
          <AuditTimeline events={auditEvents} />
        </div>
      )}

      {/* Upload/Re-upload Modal */}
      <UploadModal
        document={selectedDocForUpload}
        isOpen={!!selectedDocForUpload}
        onClose={() => setSelectedDocForUpload(null)}
        onSuccess={() => {
          setSelectedDocForUpload(null);
          fetchClientData();
        }}
      />
    </div>
  );
}
