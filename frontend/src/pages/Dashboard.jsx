import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  Activity,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { user, firmName, firmCode, isStaff } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Loading firm audit metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Audit Operations Dashboard
            </h1>
            <span className="text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">
              {firmCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active Workspace: <strong className="text-slate-700">{firmName}</strong> · Logged in as{' '}
            <span className="font-semibold text-teal-700">{user?.name} ({user?.role})</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/clients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Manage Clients</span>
          </Link>
          <Link
            to="/tenant-isolation"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span>Test Isolation</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Clients</span>
            <div className="p-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">{stats?.totalClients ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active client portfolios</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Under Review</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-3">
            {stats?.underReviewDocs ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting reviewer decision</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Correction Required</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-3">
            {stats?.correctionDocs ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Returned for staff re-upload</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved Documents</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-3">
            {stats?.approvedDocs ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Audit certified & locked</p>
        </div>
      </div>

      {/* Document Pipeline Status Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Audit Workflow State Machine Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
            <div className="text-[11px] font-bold text-amber-700">Pending Upload</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats?.pendingDocs ?? 0}</div>
          </div>
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
            <div className="text-[11px] font-bold text-blue-700">Uploaded</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats?.uploadedDocs ?? 0}</div>
          </div>
          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
            <div className="text-[11px] font-bold text-purple-700">Under Review</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats?.underReviewDocs ?? 0}</div>
          </div>
          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
            <div className="text-[11px] font-bold text-rose-700">Correction Required</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats?.correctionDocs ?? 0}</div>
          </div>
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <div className="text-[11px] font-bold text-emerald-700">Approved</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats?.approvedDocs ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Firm Audit Activity Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Firm Audit Activity (Append-Only Trail)
            </h2>
          </div>
          <Link
            to="/clients"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
          <p className="text-xs text-slate-400 py-4">No recent activity found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentActivity.map((event) => {
              const actor = event.actorId || {};
              const doc = event.documentId || {};
              const client = event.clientId || {};
              return (
                <div key={event._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">{actor.name || 'User'}</span>{' '}
                      <span className="text-slate-500">executed</span>{' '}
                      <span className="font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-[10px]">
                        {event.action}
                      </span>
                      {doc.name && (
                        <span className="text-slate-600 ml-1">
                          on <strong className="text-slate-800">{doc.name}</strong> ({client.name || 'Client'})
                        </span>
                      )}
                    </div>
                  </div>

                  <time className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(event.timestamp).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </time>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
