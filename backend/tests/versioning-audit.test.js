const request = require('supertest');
const app = require('../src/app');
const AuditEvent = require('../src/models/AuditEvent');
const Document = require('../src/models/Document');
const Client = require('../src/models/Client');
require('./setup');

describe('Append-Only Audit Architecture & Traceability', () => {
  let reviewerToken;
  let bankStatementDocId;
  let clientId;

  beforeAll(async () => {
    const revRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aman@abcca.com', password: 'password123' });
    reviewerToken = revRes.body.data.token;

    const client = await Client.findOne({ name: 'ABC Traders Pvt. Ltd.' });
    clientId = client._id.toString();

    const doc = await Document.findOne({ clientId: client._id, name: 'Bank Statement' });
    bankStatementDocId = doc._id.toString();
  });

  it('Audit history should return an append-only timeline with complete metadata', async () => {
    const res = await request(app)
      .get(`/api/documents/${bankStatementDocId}/audit-history`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const actions = res.body.data.map((e) => e.action);
    // At minimum, should have DOCUMENT_ADDED
    expect(actions).toContain('DOCUMENT_ADDED');

    for (const event of res.body.data) {
      expect(event).toHaveProperty('timestamp');
      expect(event).toHaveProperty('actorId');
      expect(event).toHaveProperty('entityType');
      expect(event).toHaveProperty('metadata');
    }
  });

  it('Direct mutation/deletion on audit events should not be exposed via API', async () => {
    // Attempting DELETE on audit route
    const deleteRes = await request(app)
      .delete(`/api/documents/${bankStatementDocId}/audit-history`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect([404, 405]).toContain(deleteRes.status);

    // Attempting PUT on audit route
    const putRes = await request(app)
      .put(`/api/documents/${bankStatementDocId}/audit-history`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({ action: 'TAMPERED' });

    expect([404, 405]).toContain(putRes.status);
  });
});
