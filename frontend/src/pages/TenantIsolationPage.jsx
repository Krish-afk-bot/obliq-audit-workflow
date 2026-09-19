import React from 'react';
import CrossTenantDemo from '../components/CrossTenantDemo';
import { ShieldCheck, Lock, Database, FileCheck2, AlertTriangle } from 'lucide-react';

export default function TenantIsolationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Multi-Tenant Isolation Architecture
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Strict database partitioning, token-derived firm IDs, and verification tests
        </p>
      </div>

      {/* Interactive Live Attack Test */}
      <CrossTenantDemo />

      {/* Architectural Guarantees */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          How Tenant Isolation is Enforced (Zero Trust Model)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>1. Token-Derived Identity</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The backend <strong>never</strong> trusts a client-supplied <code className="text-teal-800 font-mono">firmId</code> in the request body, URL query, or headers. The firm is extracted strictly from the cryptographically verified JWT token signed by our server secret.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
              <Database className="w-4 h-4" />
              <span>2. Mandatory Query Scoping</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every database operation (<code className="text-slate-800 font-mono">find</code>, <code className="text-slate-800 font-mono">findOne</code>, <code className="text-slate-800 font-mono">updateOne</code>) unconditionally injects <code className="text-teal-800 font-mono">&#123; firmId: req.user.firmId &#125;</code>. A query for another firm's ID returns 404 (non-existent).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Anti-Spoofing Middleware</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The <code className="text-slate-800 font-mono">tenant.js</code> middleware inspects incoming write payloads. If any client payload attempts to inject or overwrite a conflicting <code className="text-slate-800 font-mono">firmId</code>, it immediately halts with <strong className="text-rose-700">403 Forbidden</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
