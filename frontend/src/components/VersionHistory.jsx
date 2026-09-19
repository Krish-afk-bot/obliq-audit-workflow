import React from 'react';
import { FileText, Download, User, Calendar, CheckCircle2 } from 'lucide-react';

export default function VersionHistory({ versions = [], currentVersion, documentId }) {
  if (!versions || versions.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
        No document versions uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((ver) => {
        const isCurrent = ver.version === currentVersion;
        const uploader = ver.uploadedBy || {};
        const fileDownloadUrl = `/api/documents/${documentId}/file?file=${encodeURIComponent(ver.storagePath)}`;

        return (
          <div
            key={ver._id}
            className={`p-3.5 rounded-xl border transition ${
              isCurrent
                ? 'bg-teal-50/40 border-teal-200 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  v{ver.version}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 truncate max-w-xs">
                      {ver.originalFileName}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded text-[10px] font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {uploader.name || 'Staff'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(ver.uploadedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-400">
                      {(ver.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              </div>

              {/* View/Download File Link */}
              <a
                href={fileDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition shadow-2xs hover:text-teal-700"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>View / Download</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
