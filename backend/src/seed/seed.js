const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Firm = require('../models/Firm');
const User = require('../models/User');
const Client = require('../models/Client');
const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const AuditEvent = require('../models/AuditEvent');
const { connectDB } = require('../config/db');
const StorageService = require('../services/storage.service');

const REQUIRED_DOCUMENTS = [
  'Bank Statement',
  'Sales Register',
  'Purchase Register',
  'GST Return',
  'Expense Summary'
];

async function seedDatabase() {
  console.log('[Seed] Starting database seed...');

  // Clear existing collections
  await Promise.all([
    Firm.deleteMany({}),
    User.deleteMany({}),
    Client.deleteMany({}),
    Document.deleteMany({}),
    DocumentVersion.deleteMany({}),
    AuditEvent.deleteMany({})
  ]);

  // 1. Create Firms
  const firm1 = await Firm.create({
    name: 'ABC & Co. Chartered Accountants',
    code: 'ABC-CA',
    address: 'Suite 401, Nariman Point, Mumbai, Maharashtra 400021',
    contactEmail: 'contact@abcca.com'
  });

  const firm2 = await Firm.create({
    name: 'Apex Tax & Audit Advisors',
    code: 'APEX-TAX',
    address: '7th Floor, Cyber City, Gurugram, Haryana 122002',
    contactEmail: 'info@apexadvisors.in'
  });

  console.log(`[Seed] Created Firms: ${firm1.name} and ${firm2.name}`);

  // 2. Create Users for Firm 1
  const rohitStaff = await User.create({
    name: 'Rohit Sharma (Staff)',
    email: 'rohit@abcca.com',
    password: 'password123',
    role: 'STAFF',
    firmId: firm1._id
  });

  const amanReviewer = await User.create({
    name: 'Aman Verma (Reviewer)',
    email: 'aman@abcca.com',
    password: 'password123',
    role: 'REVIEWER',
    firmId: firm1._id
  });

  // 3. Create Users for Firm 2 (for tenant isolation verification)
  const priyaStaff = await User.create({
    name: 'Priya Mehta (Staff)',
    email: 'priya@apex.com',
    password: 'password123',
    role: 'STAFF',
    firmId: firm2._id
  });

  const vikramReviewer = await User.create({
    name: 'Vikram Singhania (Reviewer)',
    email: 'vikram@apex.com',
    password: 'password123',
    role: 'REVIEWER',
    firmId: firm2._id
  });

  console.log('[Seed] Created Users:');
  console.log('  - Rohit (Staff, Firm 1): rohit@abcca.com / password123');
  console.log('  - Aman (Reviewer, Firm 1): aman@abcca.com / password123');
  console.log('  - Priya (Staff, Firm 2): priya@apex.com / password123');
  console.log('  - Vikram (Reviewer, Firm 2): vikram@apex.com / password123');

  // 4. Create Demo Client for Firm 1: ABC Traders Pvt. Ltd.
  const client1 = await Client.create({
    name: 'ABC Traders Pvt. Ltd.',
    pan: 'AABCA1234F',
    gstin: '27AABCA1234F1Z5',
    financialYear: 'FY 2024-25',
    firmId: firm1._id,
    createdBy: rohitStaff._id
  });

  await AuditEvent.create({
    firmId: firm1._id,
    clientId: client1._id,
    actorId: rohitStaff._id,
    action: 'CLIENT_CREATED',
    entityType: 'CLIENT',
    entityId: client1._id,
    timestamp: new Date(Date.now() - 3600000 * 24),
    metadata: {
      clientName: client1.name,
      pan: client1.pan,
      gstin: client1.gstin,
      financialYear: client1.financialYear
    }
  });

  // Create required docs for client 1
  const docRecords = {};
  for (const docName of REQUIRED_DOCUMENTS) {
    const doc = await Document.create({
      firmId: firm1._id,
      clientId: client1._id,
      name: docName,
      status: 'PENDING',
      currentVersion: 0
    });
    docRecords[docName] = doc;

    await AuditEvent.create({
      firmId: firm1._id,
      clientId: client1._id,
      documentId: doc._id,
      actorId: rohitStaff._id,
      action: 'DOCUMENT_ADDED',
      entityType: 'DOCUMENT',
      entityId: doc._id,
      timestamp: new Date(Date.now() - 3600000 * 23),
      metadata: {
        documentName: doc.name,
        initialStatus: 'PENDING'
      }
    });
  }

  // Ensure sample uploads are seeded in uploads dir for immediate testing
  const uploadsDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Pre-copy sample files to uploads folder
  const sampleDir = path.resolve(__dirname, '../../../sample-data');
  const sampleFiles = [
    'HDFC_Bank_Statement_ABC_Traders_v1.pdf',
    'HDFC_Bank_Statement_ABC_Traders_v2_Corrected.pdf',
    'Sales_Register_GSTR1_Q3_FY25.csv',
    'Purchase_Register_GSTR2B_Reconciled.csv',
    'GST_Return_GSTR3B_Dec_2024.pdf',
    'Expense_Summary_Vouchers_FY25.csv',
    'Tax_Invoice_INV_2024_089.pdf'
  ];

  for (const sf of sampleFiles) {
    const src = path.join(sampleDir, sf);
    const dest = path.join(uploadsDir, `sample_${sf}`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }

  // 5. Create Demo Client for Firm 2: Sunrise Textiles LLP (for cross-tenant test)
  const client2 = await Client.create({
    name: 'Sunrise Textiles LLP',
    pan: 'BBBCS9876G',
    gstin: '24BBBCS9876G1Z2',
    financialYear: 'FY 2024-25',
    firmId: firm2._id,
    createdBy: priyaStaff._id
  });

  await AuditEvent.create({
    firmId: firm2._id,
    clientId: client2._id,
    actorId: priyaStaff._id,
    action: 'CLIENT_CREATED',
    entityType: 'CLIENT',
    entityId: client2._id,
    timestamp: new Date(Date.now() - 3600000 * 12),
    metadata: {
      clientName: client2.name,
      pan: client2.pan,
      gstin: client2.gstin
    }
  });

  for (const docName of REQUIRED_DOCUMENTS) {
    const doc = await Document.create({
      firmId: firm2._id,
      clientId: client2._id,
      name: docName,
      status: 'PENDING',
      currentVersion: 0
    });

    await AuditEvent.create({
      firmId: firm2._id,
      clientId: client2._id,
      documentId: doc._id,
      actorId: priyaStaff._id,
      action: 'DOCUMENT_ADDED',
      entityType: 'DOCUMENT',
      entityId: doc._id,
      timestamp: new Date(Date.now() - 3600000 * 11),
      metadata: {
        documentName: doc.name,
        initialStatus: 'PENDING'
      }
    });
  }

  console.log('[Seed] Database seeding completed successfully!');
}

async function autoSeedIfEmpty() {
  const firmCount = await Firm.countDocuments();
  if (firmCount === 0) {
    console.log('[Seed] Database is empty. Auto-seeding initial data...');
    await seedDatabase();
  } else {
    console.log(`[Seed] Database already has ${firmCount} firm(s). Skipping auto-seed.`);
  }
}

if (require.main === module) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      console.log('[Seed] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase, autoSeedIfEmpty };
