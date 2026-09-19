import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../api/client';

const SAMPLE_DOCS = [
  {
    name: 'Bank Statement (v1 with missing schedule)',
    filename: 'HDFC_Bank_Statement_ABC_Traders_v1.pdf',
    type: 'application/pdf',
    content: `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 595 842] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 400 >>
stream
BT
/F1 16 Tf
50 780 Td
(HDFC BANK - ACCOUNT STATEMENT PAGE 1 OF 2) Tj
/F1 10 Tf
0 -25 Td
(Account: ABC Traders Pvt Ltd | Period: Oct-Dec 2024) Tj
0 -20 Td
(Opening Balance: 12,45,200.00 | Total Withdrawals: 5,76,000.00) Tj
0 -20 Td
(Audit Note: Page 3 Quarterly Interest Schedule is Missing) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000306 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
760
%%EOF`
  },
  {
    name: 'Bank Statement (v2 Corrected with Page 3 schedule)',
    filename: 'HDFC_Bank_Statement_ABC_Traders_v2_Corrected.pdf',
    type: 'application/pdf',
    content: `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 595 842] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 450 >>
stream
BT
/F1 16 Tf
50 780 Td
(HDFC BANK - ACCOUNT STATEMENT COMPLETE 3 OF 3 PAGES) Tj
/F1 10 Tf
0 -25 Td
(Account: ABC Traders Pvt Ltd | Period: Oct-Dec 2024 COMPLETE) Tj
0 -20 Td
(Opening Balance: 12,45,200.00 | Closing Balance: 14,05,570.00) Tj
0 -20 Td
(Reconciliation Complete: All Interest & Charges verified on Page 3) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000306 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
810
%%EOF`
  },
  {
    name: 'Sales Register GSTR-1 (Q3 CSV)',
    filename: 'Sales_Register_GSTR1_Q3_FY25.csv',
    type: 'text/csv',
    content: `Invoice Number,Invoice Date,Customer Name,Customer GSTIN,Taxable Value (INR),CGST,SGST,IGST,Total
INV-2024-001,2024-10-04,Maharashtra Retailers Ltd,27AABCM1234F1Z1,125000.00,11250.00,11250.00,0.00,147500.00
INV-2024-002,2024-10-12,Karnataka Infotech Corp,29BBBCK5678G2Z2,240000.00,0.00,0.00,43200.00,283200.00
INV-2024-003,2024-10-25,Gujarat Polymers LLP,24CCCDG9012H3Z3,85000.00,0.00,0.00,15300.00,100300.00`
  },
  {
    name: 'Purchase Register GSTR-2B (CSV)',
    filename: 'Purchase_Register_GSTR2B_Reconciled.csv',
    type: 'text/csv',
    content: `Bill Ref,Vendor Name,Vendor GSTIN,Taxable Value (INR),Total Bill,ITC Eligibility,2B Status
PR-2024-101,Tata Steel Distribution,27AABCT2020L1Z5,210000.00,247800.00,ELIGIBLE,MATCHED
PR-2024-102,Reliance Industrial Supplies,24AAACR1010M2Z6,145000.00,171100.00,ELIGIBLE,MATCHED`
  }
];

export default function UploadModal({ document, isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !document) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSelectSample = (sample) => {
    const blob = new Blob([sample.content], { type: sample.type });
    const sampleFile = new File([blob], sample.filename, { type: sample.type });
    setFile(sampleFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or generate a file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.documents.upload(document._id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isReupload = document.status === 'CORRECTION_REQUIRED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {isReupload ? 'Re-upload Corrected Document' : 'Upload Document'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {document.name} · Target Version: v{document.currentVersion + 1}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {isReupload && document.latestCorrectionComment && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                Reviewer's Requested Correction:
              </div>
              <p className="text-xs text-amber-900 mt-1 italic">
                "{document.latestCorrectionComment}"
              </p>
            </div>
          )}

          {/* 1-Click Quick Select from Synthetic Dataset */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Quick Pick Synthetic Dataset:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_DOCS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="text-left p-2.5 bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 rounded-lg transition text-xs group"
                >
                  <div className="font-medium text-slate-800 group-hover:text-teal-900 line-clamp-1">
                    {sample.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {sample.filename}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-teal-400 transition bg-slate-50/50">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.csv,.xlsx,.xls,.txt,.png,.jpg"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">
                {file ? file.name : 'Click to select or drag a file here'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, Excel, CSV, Images (Max 15MB)
              </p>
              {file && (
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected: {(file.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </label>
          </div>

          {/* Action Buttons */}
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
              disabled={uploading || !file}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              {uploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{uploading ? 'Uploading...' : isReupload ? 'Submit Revision (v' + (document.currentVersion + 1) + ')' : 'Upload Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
