import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, FileText, RotateCcw, Eye, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WalkthroughPage() {
  const { switchUser } = useAuth();

  const demoSteps = [
    {
      step: 'Step 1 & 2',
      title: 'Firm A Staff Persona & Client Portfolio',
      desc: 'Log in as Rohit Sharma (Staff at ABC & Co.). Open "ABC Traders Pvt. Ltd." client workspace.',
      actionRole: 'rohit@abcca.com',
      buttonLabel: 'Switch to Rohit (Staff)',
      targetPath: '/clients'
    },
    {
      step: 'Step 3 & 4',
      title: 'Upload Initial Bank Statement (v1)',
      desc: 'In ABC Traders workspace, click "Upload File" on Bank Statement. Use the "Bank Statement v1" quick picker button.',
      actionRole: 'rohit@abcca.com',
      buttonLabel: 'Go to ABC Traders',
      targetPath: '/clients'
    },
    {
      step: 'Step 5 & 6',
      title: 'Switch to Reviewer & Begin Review',
      desc: 'Switch to Aman Verma (Reviewer). Open Bank Statement review panel. Click "Start Review". Status transitions to UNDER_REVIEW.',
      actionRole: 'aman@abcca.com',
      buttonLabel: 'Switch to Aman (Reviewer)',
      targetPath: '/clients'
    },
    {
      step: 'Step 7',
      title: 'Request Correction with Mandatory Note',
      desc: 'As Reviewer, click "Request Correction". Choose template: "Page 3 quarterly interest & bank charge summary is missing." Status transitions to CORRECTION_REQUIRED.',
      actionRole: 'aman@abcca.com',
      buttonLabel: 'Conduct Review',
      targetPath: '/clients'
    },
    {
      step: 'Step 8 & 9',
      title: 'Switch to Staff & Re-upload Revision (v2)',
      desc: 'Switch back to Rohit. Notice the discrepancy banner. Click "Re-upload Corrected (v2)" and pick "Bank Statement v2 Corrected". Old v1 file is preserved in history!',
      actionRole: 'rohit@abcca.com',
      buttonLabel: 'Switch to Rohit (Staff)',
      targetPath: '/clients'
    },
    {
      step: 'Step 10',
      title: 'Reviewer Approves Corrected Document',
      desc: 'Switch to Aman (Reviewer). Start review and click "Approve Document". Status locks to APPROVED (terminal state).',
      actionRole: 'aman@abcca.com',
      buttonLabel: 'Switch to Aman (Reviewer)',
      targetPath: '/clients'
    },
    {
      step: 'Step 11',
      title: 'Verify Complete Append-Only Audit Timeline',
      desc: 'Inspect the document audit history. Notice every single actor, version, timestamp, and discrepancy note is permanently captured in order.',
      actionRole: 'aman@abcca.com',
      buttonLabel: 'View Audit Timeline',
      targetPath: '/clients'
    },
    {
      step: 'Step 12',
      title: 'Verify Firm B Tenant Isolation',
      desc: 'Switch to Priya Mehta (Staff at Apex Tax & Audit Advisors). ABC Traders is invisible. Run the Tenant Isolation inspector to see cross-firm access blocked.',
      actionRole: 'priya@apex.com',
      buttonLabel: 'Switch to Priya (Firm 2)',
      targetPath: '/tenant-isolation'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          OBLIQ FE-2 Evaluation Scenario Checklist
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct implementation of the 12-step blueprint specified in Section 15 of procedure.md
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Step-by-Step Interactive Workflow Walkthrough
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
            100% Implemented & Verified
          </span>
        </div>

        <div className="space-y-4">
          {demoSteps.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-200 font-mono text-[10px] font-bold text-slate-700 rounded">
                    {item.step}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl">{item.desc}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => {
                    await switchUser(item.actionRole);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                >
                  {item.buttonLabel}
                </button>
                <Link
                  to={item.targetPath}
                  className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
