import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Download,
  FileText,
  History,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UploadModal from '../components/UploadModal';
import CorrectionModal from '../components/CorrectionModal';
import ApproveModal from '../components/ApproveModal';
import VersionHistory from '../components/VersionHistory';
import AuditTimeline from '../components/AuditTimeline';

export default function DocumentReview() {
  const { documentId } = useParams();
  const { isReviewer, isStaff, role } = useAuth();
  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const fetchDocumentData = async () => {
    try {
      setLoading(true);
      const res = await api.documents.get(documentId);
      setDocument(res.data);
      setVersions(res.data.versions || []);

      const auditRes = await api.documents.getAuditHistory(documentId);
      setAuditEvents(auditRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load document review data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentData();
  }, [documentId]);

  const handleStartReview = async () => {
    try {
      setActionLoading(true);
      await api.reviews.start(documentId);
      await fetchDocumentData();
    } catch (err) {
      alert(err.message || 'Failed to start review');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Loading document review workspace...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Document Not Found or Access Denied</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {error || 'This document either does not exist or belongs to another firm tenant.'}
          </p>
        </div>
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </Link>
      </div>
    );
  }

  const latestVersion = versions.find((v) => v.version === document.currentVersion);
  const clientInfo = document.clientId || {};
  const isPending = document.status === 'PENDING';
  const isUploaded = document.status === 'UPLOADED';
  const isUnderReview = document.status === 'UNDER_REVIEW';
  const isCorrection = document.status === 'CORRECTION_REQUIRED';
  const isApproved = document.status === 'APPROVED';

  // Step index for progress indicator
  const steps = [
    { key: 'PENDING', label: '1. Pending' },
    { key: 'UPLOADED', label: '2. Uploaded' },
    { key: 'UNDER_REVIEW', label: '3. Under Review' },
    { key: 'DECISION', label: '4. Decision (Approve / Correction)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/clients/${clientInfo._id || ''}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {clientInfo.name || 'Client Workspace'}</span>
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {document.name}
                </h1>
                <StatusBadge status={document.status} />
                {document.currentVersion > 0 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded">
                    Version v{document.currentVersion}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Client: <strong className="text-slate-700">{clientInfo.name}</strong> · Financial Year:{' '}
                <strong className="text-slate-700">{clientInfo.financialYear}</strong>
              </p>
            </div>

            {/* Role indicator banner */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-50 border-slate-200 text-xs">
              <span className="text-slate-500">Active Role:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  isReviewer ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {role}
              </span>
            </div>
          </div>

          {/* Workflow Stepper Bar */}
          <div className="pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  isPending
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <span>1. Pending</span>
                {!isPending && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  isUploaded
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : document.currentVersion > 0
                    ? 'bg-slate-50 text-slate-500 border-slate-200'
                    : 'bg-slate-50/50 text-slate-400 border-slate-200'
                }`}
              >
                <span>2. Uploaded (v{document.currentVersion})</span>
                {document.currentVersion > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  isUnderReview
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : isApproved
                    ? 'bg-slate-50 text-slate-500 border-slate-200'
                    : 'bg-slate-50/50 text-slate-400 border-slate-200'
                }`}
              >
                <span>3. Under Review</span>
                {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : isCorrection
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-slate-50/50 text-slate-400 border-slate-200'
                }`}
              >
                <span>4. {isApproved ? 'Approved' : isCorrection ? 'Correction Required' : 'Certified'}</span>
                {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {isCorrection && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancy alert banner if correction requested */}
      {isCorrection && document.latestCorrectionComment && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                Audit Discrepancy Flagged by Reviewer
              </h4>
              <p className="text-xs text-rose-900 mt-1 italic font-medium">
                "{document.latestCorrectionComment}"
              </p>
              <p className="text-[11px] text-rose-600 mt-1.5">
                Staff action required: Rectify the issue and submit version v{document.currentVersion + 1}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-upload Corrected (v{document.currentVersion + 1})</span>
          </button>
        </div>
      )}

      {/* Reviewer Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Workflow State Machine Controller
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Available actions governed strictly by your active role ({role}) and document state
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* 1. Upload for Pending */}
            {isPending && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Document File</span>
              </button>
            )}

            {/* 2. Reviewer: Start Review */}
            {isUploaded && isReviewer && (
              <button
                onClick={handleStartReview}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <Eye className="w-4 h-4" />
                <span>Start Review (Begin Verification)</span>
              </button>
            )}

            {/* If uploaded but logged in as STAFF */}
            {isUploaded && isStaff && (
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Waiting for Reviewer (Aman) to start review</span>
              </div>
            )}

            {/* 3. Reviewer: Decision Buttons (Approve or Correction) */}
            {isUnderReview && isReviewer && (
              <>
                <button
                  onClick={() => setCorrectionModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Request Correction</span>
                </button>
                <button
                  onClick={() => setApproveModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Document</span>
                </button>
              </>
            )}

            {/* If under review but user is Staff */}
            {isUnderReview && isStaff && (
              <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl text-xs flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Under Review by Reviewer. Staff cannot approve or reject.</span>
              </div>
            )}

            {/* Re-upload for Staff on Correction Required */}
            {isCorrection && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Revised File</span>
              </button>
            )}

            {/* Approved State */}
            {isApproved && (
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Audit Certified & Locked (Terminal State)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active File Preview Box */}
      {latestVersion && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Active Document File (v{latestVersion.version})
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {latestVersion.originalFileName} · {(latestVersion.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            <a
              href={`/api/documents/${document._id}/file?file=${encodeURIComponent(latestVersion.storagePath)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition border border-teal-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Stored File</span>
            </a>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs text-slate-500 flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">Audit File Metadata:</span>
              <span className="font-mono text-[11px]">MIME: {latestVersion.mimeType}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Uploaded By</span>
                <span className="font-semibold text-slate-800">
                  {latestVersion.uploadedBy?.name || 'Staff User'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Upload Timestamp</span>
                <span className="font-semibold text-slate-800">
                  {new Date(latestVersion.uploadedAt).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Storage Integrity</span>
                <span className="font-mono text-emerald-700 font-bold text-[11px]">
                  Secure Tenant Isolated
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side Tabs: Version History & Append-Only Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version History */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Document Version History ({versions.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Never Overwritten</span>
          </div>

          <VersionHistory
            versions={versions}
            currentVersion={document.currentVersion}
            documentId={document._id}
          />
        </div>

        {/* Append-Only Audit Trail */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Append-Only Audit Timeline ({auditEvents.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Immutable</span>
          </div>

          <AuditTimeline events={auditEvents} />
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        document={document}
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          setUploadModalOpen(false);
          fetchDocumentData();
        }}
      />

      <CorrectionModal
        document={document}
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        onSuccess={() => {
          setCorrectionModalOpen(false);
          fetchDocumentData();
        }}
      />

      <ApproveModal
        document={document}
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onSuccess={() => {
          setApproveModalOpen(false);
          fetchDocumentData();
        }}
      />
    </div>
  );
}
