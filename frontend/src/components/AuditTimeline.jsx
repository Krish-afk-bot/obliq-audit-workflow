import React from 'react';
import {
  FilePlus,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Eye,
  Building2,
  Clock,
  User,
  RotateCcw
} from 'lucide-react';

const ACTION_CONFIG = {
  CLIENT_CREATED: {
    label: 'Client Registered',
    icon: Building2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200'
  },
  DOCUMENT_ADDED: {
    label: 'Document Initialized',
    icon: FilePlus,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200'
  },
  DOCUMENT_UPLOADED: {
    label: 'Initial Document Uploaded',
    icon: UploadCloud,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  DOCUMENT_REUPLOADED: {
    label: 'Corrected Document Re-uploaded',
    icon: RotateCcw,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  REVIEW_STARTED: {
    label: 'Audit Review Commenced',
    icon: Eye,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  CORRECTION_REQUESTED: {
    label: 'Correction Requested',
    icon: AlertCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200'
  },
  DOCUMENT_APPROVED: {
    label: 'Document Approved & Certified',
    icon: FileCheck2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  }
};

export default function AuditTimeline({ events = [], loading = false }) {
  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs">Loading audit events...</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        No audit events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event) => {
        const config = ACTION_CONFIG[event.action] || {
          label: event.action,
          icon: Clock,
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-200'
        };
        const Icon = config.icon;
        const actor = event.actorId || {};
        const meta = event.metadata || {};

        return (
          <div key={event._id} className="relative group">
            {/* Timeline Marker Dot */}
            <div
              className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${config.color} ${config.border} shadow-xs`}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>

            {/* Event Content Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-xs font-bold ${config.color}`}>
                    {config.label}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{actor.name || 'System'}</span>
                    {actor.role && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          actor.role === 'REVIEWER'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {actor.role}
                      </span>
                    )}
                  </div>
                </div>

                <time className="text-[11px] font-mono text-slate-400 shrink-0">
                  {new Date(event.timestamp).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </time>
              </div>

              {/* Metadata Details */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
                {meta.version && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Version:</span>
                    <span className="px-2 py-0.5 bg-slate-100 font-mono text-slate-700 rounded text-[11px] font-bold">
                      v{meta.version}
                    </span>
                  </div>
                )}

                {meta.fileName && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">File:</span>
                    <span className="text-slate-700 font-mono text-[11px] truncate max-w-xs">
                      {meta.fileName}
                    </span>
                    {meta.fileSize && (
                      <span className="text-slate-400 text-[10px]">
                        ({(meta.fileSize / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>
                )}

                {meta.reason && (
                  <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs">
                    <span className="font-bold block mb-0.5">Discrepancy / Reason:</span>
                    <span className="italic">"{meta.reason}"</span>
                  </div>
                )}

                {meta.approvalNote && (
                  <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs">
                    <span className="font-bold block mb-0.5">Approval Sign-off Note:</span>
                    <span>"{meta.approvalNote}"</span>
                  </div>
                )}

                {meta.previousStatus && meta.newStatus && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>State Transition:</span>
                    <span className="font-mono text-slate-600">{meta.previousStatus}</span>
                    <span>→</span>
                    <span className="font-mono font-bold text-slate-800">{meta.newStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
