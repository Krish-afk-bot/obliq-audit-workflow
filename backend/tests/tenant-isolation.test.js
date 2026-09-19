const request = require('supertest');
const app = require('../src/app');
const Client = require('../src/models/Client');
const Document = require('../src/models/Document');
require('./setup');

describe('Strict Tenant Isolation Verification', () => {
  let firmAToken; // Rohit (Firm 1: ABC-CA)
  let firmBToken; // Priya (Firm 2: APEX-TAX)
  let firmAClientId;
  let firmBClientId;
  let firmBDocumentId;

  beforeAll(async () => {
    // Login Firm A user
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rohit@abcca.com', password: 'password123' });
    firmAToken = resA.body.data.token;

    // Login Firm B user
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya@apex.com', password: 'password123' });
    firmBToken = resB.body.data.token;

    // Retrieve client IDs from DB
    const clientA = await Client.findOne({ name: 'ABC Traders Pvt. Ltd.' });
    firmAClientId = clientA._id.toString();

    const clientB = await Client.findOne({ name: 'Sunrise Textiles LLP' });
    firmBClientId = clientB._id.toString();

    const docB = await Document.findOne({ clientId: clientB._id });
    firmBDocumentId = docB._id.toString();
  });

  it('Firm A user should only see Firm A clients and never see Firm B clients', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${firmAToken}`);

    expect(res.status).toBe(200);
    const clientNames = res.body.data.map((c) => c.name);
    expect(clientNames).toContain('ABC Traders Pvt. Ltd.');
    expect(clientNames).not.toContain('Sunrise Textiles LLP');
  });

  it('Firm A user attempting to read Firm B client directly must receive 404 Not Found', async () => {
    const res = await request(app)
      .get(`/api/clients/${firmBClientId}`)
      .set('Authorization', `Bearer ${firmAToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Firm A user attempting to read Firm B client documents must receive 404 Not Found', async () => {
    const res = await request(app)
      .get(`/api/clients/${firmBClientId}/documents`)
      .set('Authorization', `Bearer ${firmAToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Firm A user attempting to read Firm B document directly must receive 404 Not Found', async () => {
    const res = await request(app)
      .get(`/api/documents/${firmBDocumentId}`)
      .set('Authorization', `Bearer ${firmAToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Firm A user attempting to read Firm B audit trail must receive 404 Not Found', async () => {
    const res = await request(app)
      .get(`/api/documents/${firmBDocumentId}/audit-history`)
      .set('Authorization', `Bearer ${firmAToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Reject requests attempting to inject or spoof a different firmId in payload', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${firmAToken}`)
      .send({
        name: 'Malicious Injected Firm Client',
        firmId: '60c72b2f9b1d8b2bad6e1234' // Attempting to spoof
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Security violation: Cross-tenant firmId modification is prohibited');
  });
});
