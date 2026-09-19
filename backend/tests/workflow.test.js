const request = require('supertest');
const path = require('path');
const app = require('../src/app');
const Document = require('../src/models/Document');
const Client = require('../src/models/Client');
require('./setup');

describe('Document Review Workflow & Role Enforcement', () => {
  let staffToken;    // Rohit (STAFF)
  let reviewerToken; // Aman (REVIEWER)
  let bankStatementDocId;
  const sampleFilePath = path.resolve(__dirname, '../../sample-data/Sales_Register_GSTR1_Q3_FY25.csv');

  beforeAll(async () => {
    // Login Staff
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rohit@abcca.com', password: 'password123' });
    staffToken = staffRes.body.data.token;

    // Login Reviewer
    const revRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aman@abcca.com', password: 'password123' });
    reviewerToken = revRes.body.data.token;

    // Find Bank Statement document for ABC Traders
    const client = await Client.findOne({ name: 'ABC Traders Pvt. Ltd.' });
    const doc = await Document.findOne({ clientId: client._id, name: 'Bank Statement' });
    bankStatementDocId = doc._id.toString();
  });

  it('Initial state of document must be PENDING and version 0', async () => {
    const res = await request(app)
      .get(`/api/documents/${bankStatementDocId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.currentVersion).toBe(0);
  });

  it('Cannot start review or approve a PENDING document', async () => {
    // Attempt review start on PENDING
    const revStartRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/start`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(revStartRes.status).toBe(400);
    expect(revStartRes.body.error).toContain('Cannot change status from \'PENDING\'');

    // Attempt approve on PENDING
    const approveRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/approve`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(approveRes.status).toBe(400);
  });

  it('Staff uploads v1: transitions PENDING -> UPLOADED and increments version to 1', async () => {
    const res = await request(app)
      .post(`/api/documents/${bankStatementDocId}/upload`)
      .set('Authorization', `Bearer ${staffToken}`)
      .attach('file', sampleFilePath);

    expect(res.status).toBe(200);
    expect(res.body.data.document.status).toBe('UPLOADED');
    expect(res.body.data.document.currentVersion).toBe(1);
    expect(res.body.data.version.version).toBe(1);
  });

  it('Staff cannot approve documents or request corrections (Role Guard check)', async () => {
    // Staff attempts to start review
    const startRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/start`)
      .set('Authorization', `Bearer ${staffToken}`);
    expect(startRes.status).toBe(403);
    expect(startRes.body.error).toContain("Role 'STAFF' is not authorized");

    // Staff attempts to approve
    const approveRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/approve`)
      .set('Authorization', `Bearer ${staffToken}`);
    expect(approveRes.status).toBe(403);

    // Staff attempts to request correction
    const corrRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/correction`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ comment: 'Illegal staff comment' });
    expect(corrRes.status).toBe(403);
  });

  it('Reviewer starts review: transitions UPLOADED -> UNDER_REVIEW', async () => {
    const res = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/start`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('UNDER_REVIEW');
  });

  it('Correction request requires a mandatory comment/reason', async () => {
    const res = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/correction`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({ comment: '   ' }); // Empty whitespace

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('mandatory');
  });

  it('Reviewer requests correction: transitions UNDER_REVIEW -> CORRECTION_REQUIRED', async () => {
    const res = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/correction`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({ comment: 'Page 3 quarterly interest & charge summary missing. Please reconcile.' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CORRECTION_REQUIRED');
    expect(res.body.data.latestCorrectionComment).toContain('Page 3 quarterly interest');
  });

  it('Staff re-uploads v2: transitions CORRECTION_REQUIRED -> UPLOADED and preserves v1', async () => {
    const res = await request(app)
      .post(`/api/documents/${bankStatementDocId}/upload`)
      .set('Authorization', `Bearer ${staffToken}`)
      .attach('file', sampleFilePath);

    expect(res.status).toBe(200);
    expect(res.body.data.document.status).toBe('UPLOADED');
    expect(res.body.data.document.currentVersion).toBe(2);

    // Verify both versions exist and v1 was not destroyed
    const versionsRes = await request(app)
      .get(`/api/documents/${bankStatementDocId}/versions`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(versionsRes.status).toBe(200);
    expect(versionsRes.body.data.length).toBe(2);
    expect(versionsRes.body.data.map((v) => v.version)).toEqual([2, 1]);
  });

  it('Reviewer reviews v2 and approves: UPLOADED -> UNDER_REVIEW -> APPROVED', async () => {
    // 1. Start review
    const startRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/start`)
      .set('Authorization', `Bearer ${reviewerToken}`);
    expect(startRes.status).toBe(200);
    expect(startRes.body.data.status).toBe('UNDER_REVIEW');

    // 2. Approve
    const approveRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/approve`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({ note: 'Reconciliation verified. Approved.' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('APPROVED');
  });

  it('Cannot re-upload or review an APPROVED document (Terminal state)', async () => {
    const uploadRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/upload`)
      .set('Authorization', `Bearer ${staffToken}`)
      .attach('file', sampleFilePath);

    expect(uploadRes.status).toBe(400);
    expect(uploadRes.body.error).toContain('APPROVED');

    const startRes = await request(app)
      .post(`/api/documents/${bankStatementDocId}/review/start`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(startRes.status).toBe(400);
  });
});
