const fs = require('fs');
const path = require('path');

function createSimplePdf(filename, title, lines) {
  const contentStream = [
    'BT',
    '/F1 16 Tf',
    '50 780 Td',
    `(${title}) Tj`,
    '/F1 10 Tf',
    '0 -25 Td',
    ...lines.map((l) => `(${l.replace(/[\(\)\\]/g, '\\$&')}) Tj\n0 -16 Td`),
    'ET'
  ].join('\n');

  const streamLength = Buffer.byteLength(contentStream, 'utf-8');

  const pdf = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
  /MediaBox [0 0 595 842]
  /Contents 4 0 R
>>
endobj
4 0 obj
<<
  /Length ${streamLength}
>>
stream
${contentStream}
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
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${370 + streamLength}
%%EOF`;

  const outPath = path.resolve(__dirname, filename);
  fs.writeFileSync(outPath, pdf);
  console.log(`Generated: ${outPath}`);
}

// 1. Bank statement v1 (Discrepancy: missing page 3 / reconciliation notes)
createSimplePdf('HDFC_Bank_Statement_ABC_Traders_v1.pdf', 'HDFC BANK - ACCOUNT STATEMENT (PAGE 1 OF 2)', [
  'Account Name: ABC Traders Private Limited | Account No: 50200045892109',
  'Branch: Fort, Mumbai | IFSC: HDFC0000060 | Period: 01-Oct-2024 to 31-Dec-2024',
  '--------------------------------------------------------------------------------------------------',
  'DATE          CHQ/REF NO    PARTICULARS                          WITHDRAWAL     DEPOSIT       BALANCE',
  '01-OCT-2024   INIT-BAL      Opening Balance                      -              -             12,45,200.00',
  '04-OCT-2024   UPI-42890123  UPI/MAHARASHTRA RETAIL/ICICI         -              1,47,500.00   13,92,700.00',
  '08-OCT-2024   RTGS-4001923  RTGS/TATA STEEL DIST/SBI             2,47,800.00    -             11,44,900.00',
  '15-OCT-2024   NEFT-8839124  NEFT/KULKARNI & DESHMUKH CA          45,000.00      -             10,99,900.00',
  '19-OCT-2024   IMPS-5510294  IMPS/RELIANCE IND/HDFC               1,71,100.00    -              9,28,800.00',
  '26-OCT-2024   UPI-77182901  UPI/GUJARAT POLYMERS/AXIS            -              1,00,300.00   10,29,100.00',
  '05-NOV-2024   NEFT-3091823  NEFT/INFOSYS IT INFRA/ICICI          1,12,100.00    -              9,17,000.00',
  '19-NOV-2024   RTGS-8910283  RTGS/BENGALURU CLOUD/KOTAK           -              3,65,800.00   12,82,800.00',
  '--------------------------------------------------------------------------------------------------',
  '[NOTE: Page 2 of 2 attached. (Audit observation: Page 3 quarterly interest & charge summary missing)]'
]);

// 2. Bank statement v2 (Corrected with full ledger reconciliation and complete schedule)
createSimplePdf('HDFC_Bank_Statement_ABC_Traders_v2_Corrected.pdf', 'HDFC BANK - ACCOUNT STATEMENT (COMPLETE 3 OF 3 PAGES)', [
  'Account Name: ABC Traders Private Limited | Account No: 50200045892109',
  'Branch: Fort, Mumbai | IFSC: HDFC0000060 | Period: 01-Oct-2024 to 31-Dec-2024 (COMPLETE)',
  '--------------------------------------------------------------------------------------------------',
  'DATE          CHQ/REF NO    PARTICULARS                          WITHDRAWAL     DEPOSIT       BALANCE',
  '01-OCT-2024   INIT-BAL      Opening Balance                      -              -             12,45,200.00',
  '04-OCT-2024   UPI-42890123  UPI/MAHARASHTRA RETAIL/ICICI         -              1,47,500.00   13,92,700.00',
  '08-OCT-2024   RTGS-4001923  RTGS/TATA STEEL DIST/SBI             2,47,800.00    -             11,44,900.00',
  '15-OCT-2024   NEFT-8839124  NEFT/KULKARNI & DESHMUKH CA          45,000.00      -             10,99,900.00',
  '19-OCT-2024   IMPS-5510294  IMPS/RELIANCE IND/HDFC               1,71,100.00    -              9,28,800.00',
  '26-OCT-2024   UPI-77182901  UPI/GUJARAT POLYMERS/AXIS            -              1,00,300.00   10,29,100.00',
  '05-NOV-2024   NEFT-3091823  NEFT/INFOSYS IT INFRA/ICICI          1,12,100.00    -              9,17,000.00',
  '19-NOV-2024   RTGS-8910283  RTGS/BENGALURU CLOUD/KOTAK           -              3,65,800.00   12,82,800.00',
  '15-DEC-2024   UPI-90182381  UPI/DELHI HARDWARE/PNB               -              1,08,560.00   13,91,360.00',
  '31-DEC-2024   INT-CREDIT    Quarterly Bank Interest Credit       -                   14,210.00 14,05,570.00',
  '--------------------------------------------------------------------------------------------------',
  'RECONCILIATION SUMMARY: Page 3 Attached. Closing Balance Verified: INR 14,05,570.00'
]);

// 3. GST Return 3B Dec 2024
createSimplePdf('GST_Return_GSTR3B_Dec_2024.pdf', 'FORM GSTR-3B [See Rule 61(5)] - Monthly Summary Return', [
  'GSTIN: 27AABCA1234F1Z5 | Legal Name: ABC Traders Private Limited | FY: 2024-2025 | Month: Dec 2024',
  '--------------------------------------------------------------------------------------------------',
  '3.1 Details of Outward Supplies and inward supplies liable to reverse charge:',
  '  (a) Outward taxable supplies (other than zero-rated, nil rated and exempted):',
  '      Total Taxable Value: INR 4,17,000.00 | IGST: INR 43,560.00 | CGST: INR 15,750.00 | SGST: INR 15,750.00',
  '4. Eligible ITC (Input Tax Credit):',
  '  (A) ITC Available (whether in full or part):',
  '      (5) All other ITC: IGST: INR 3,330.00 | CGST: INR 1,152.00 | SGST: INR 1,152.00',
  '5. Payment of Tax: Paid via Electronic Cash Ledger. Challan CIN: HDFC24122700192.',
  '--------------------------------------------------------------------------------------------------',
  'Verification: I hereby solemnly affirm that the information given above is true and correct.'
]);

// 4. Sample B2B Invoice
createSimplePdf('Tax_Invoice_INV_2024_089.pdf', 'TAX INVOICE - B2B SUPPLY (GST COMPLIANT)', [
  'Invoice No: INV-2024-089 | Invoice Date: 12-Nov-2024 | Reverse Charge: No',
  'Supplier: TechCraft Electronics India LLP | GSTIN: 27AABCT9988G1Z3 | State: 27-Maharashtra',
  'Billed to: ABC Traders Private Limited | GSTIN: 27AABCA1234F1Z5 | State: 27-Maharashtra',
  '--------------------------------------------------------------------------------------------------',
  'Item Description: Server Equipment Rack 42U & Cable Organizers | HSN: 847330',
  'Qty: 2 Nos | Rate: INR 48,000.00 | Taxable Value: INR 96,000.00',
  'CGST @ 9%: INR 8,640.00 | SGST @ 9%: INR 8,640.00',
  'Total Invoice Value in Words: INR One Lakh Thirteen Thousand Two Hundred Eighty Only (INR 1,13,280.00)',
  '--------------------------------------------------------------------------------------------------',
  'Authorized Signatory for TechCraft Electronics India LLP'
]);
