# OBLIQ-in FE-2 Evaluation — Procedure & Implementation Blueprint

## 1. Objective

Build a small, production-minded **Multi-Tenant Audit Document Review System** for CA firms.

Required workflow:

Client → Required Documents → Upload → Review → Approve / Request Correction → Re-upload → Audit History

Prioritize a working product, secure backend authorization, traceable audit history, and clear architecture over extra features.

---

## 2. Recommended Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- JWT authentication
- Multer (or equivalent) for multipart upload

### Database
- MongoDB
- Mongoose

### Storage
- Local storage for the prototype
- Hide storage behind a `storageService` abstraction for future object storage

### Testing
- API tests for authentication, tenant isolation, and workflow transitions
- Manual end-to-end workflow test

---

## 3. Product Roles

### Staff
Can:
- View clients belonging to their firm
- Upload documents
- View document status
- Re-upload corrected documents

Cannot:
- Approve documents
- Request corrections

### Reviewer
Can:
- View clients/documents belonging to their firm
- Start reviews
- Approve documents
- Request corrections
- View audit history

### Firm isolation
A user belongs to one firm through `firmId`.

Users must never access another firm's clients, documents, document versions, or audit events.

Frontend hiding is not a security boundary. Tenant isolation must be enforced by the backend.

---

## 4. User Flow

### Login
1. Open `/login`.
2. Submit email/password.
3. Backend authenticates.
4. Return user context: id, name, role, firmId.
5. Redirect to dashboard.

### Dashboard
Show:
- clients
- documents under review
- correction-required documents
- approved documents
- recent activity

Do not build a complex analytics platform.

### Create Client
1. Staff creates a client.
2. Backend gets `firmId` from `req.user.firmId`.
3. Create client under that firm.
4. Create `CLIENT_CREATED` audit event.

### Required Documents
Initialize:
- Bank Statement
- Sales Register
- Purchase Register
- GST Return
- Expense Summary

Each starts at `PENDING`.

### Upload
1. Staff selects a document.
2. Send multipart upload.
3. Backend checks authentication, role, firm/resource ownership, state, and file validation.
4. Store file.
5. Create document version.
6. Transition `PENDING → UPLOADED` or `CORRECTION_REQUIRED → UPLOADED`.
7. Create upload audit event.

### Review
Reviewer:
1. Opens uploaded document.
2. Starts review: `UPLOADED → UNDER_REVIEW`.
3. Either approves: `UNDER_REVIEW → APPROVED`.
4. Or requests correction: `UNDER_REVIEW → CORRECTION_REQUIRED`, with mandatory comment.

### Re-upload
1. Staff sees correction reason.
2. Uploads revised file.
3. Create next version.
4. Preserve old version.
5. Transition `CORRECTION_REQUIRED → UPLOADED`.
6. Create `DOCUMENT_REUPLOADED`.

---

## 5. Document State Machine

```text
PENDING
   |
   | upload
   v
UPLOADED
   |
   | start review
   v
UNDER_REVIEW
   |
   +----------------------+
   |                      |
   | approve              | request correction
   v                      v
APPROVED           CORRECTION_REQUIRED
                          |
                          | re-upload
                          v
                       UPLOADED
```

Valid transitions:

```text
PENDING → UPLOADED
UPLOADED → UNDER_REVIEW
UNDER_REVIEW → APPROVED
UNDER_REVIEW → CORRECTION_REQUIRED
CORRECTION_REQUIRED → UPLOADED
```

Do not expose a generic status-update endpoint. Use business-action endpoints such as `/review/start`, `/review/approve`, `/review/correction`, and `/upload`.

---

## 6. Audit Architecture

Audit history is a first-class system.

### AuditEvent

```text
_id
firmId
clientId
documentId
actorId
action
entityType
entityId
timestamp
metadata
```

Recommended actions:

```text
CLIENT_CREATED
DOCUMENT_ADDED
DOCUMENT_UPLOADED
DOCUMENT_REUPLOADED
REVIEW_STARTED
CORRECTION_REQUESTED
DOCUMENT_APPROVED
```

Example:

```json
{
  "firmId": "firm_123",
  "clientId": "client_456",
  "documentId": "doc_789",
  "actorId": "user_111",
  "action": "CORRECTION_REQUESTED",
  "entityType": "DOCUMENT",
  "entityId": "doc_789",
  "timestamp": "2026-09-18T10:07:00Z",
  "metadata": {
    "version": 1,
    "reason": "Page 3 is missing."
  }
}
```

Audit events should be append-only from the normal application layer. Do not provide normal-user update/delete endpoints.

---

## 7. Document Versioning

Separate the current document record from uploaded versions.

### Document

```text
_id
firmId
clientId
name
status
currentVersion
createdAt
updatedAt
```

### DocumentVersion

```text
_id
documentId
version
fileUrl
uploadedBy
uploadedAt
```

Example:

```text
Bank Statement
 ├── v1 — correction requested
 └── v2 — approved
```

Never silently destroy the previous version.

---

## 8. Complete API Contract

### Authentication

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Clients

```text
GET  /api/clients
POST /api/clients
GET  /api/clients/:clientId
```

### Documents

```text
GET  /api/clients/:clientId/documents
POST /api/clients/:clientId/documents
GET  /api/documents/:documentId
POST /api/documents/:documentId/upload
```

### Review Workflow

```text
POST /api/documents/:documentId/review/start
POST /api/documents/:documentId/review/approve
POST /api/documents/:documentId/review/correction
```

### Versions

```text
GET /api/documents/:documentId/versions
GET /api/documents/:documentId/versions/:version
```

### Audit

```text
GET /api/documents/:documentId/audit-history
```

---

## 9. Request Processing Pipeline

Every protected request:

```text
HTTP Request
     ↓
Authentication
     ↓
Identify User
     ↓
Role Authorization
     ↓
Tenant Scope
     ↓
Resource Ownership Check
     ↓
Business Rule / State Transition
     ↓
Database Mutation
     ↓
Audit Event
     ↓
Response
```

Example:

```text
POST /api/documents/:id/review/approve
        ↓
authenticate()
        ↓
authorize(REVIEWER)
        ↓
find document where:
_id = id
AND firmId = req.user.firmId
        ↓
workflow.canApprove()
        ↓
update document
        ↓
create AuditEvent
        ↓
response
```

---

## 10. Tenant Isolation Procedure

Never trust `firmId` supplied by the frontend.

Use `req.user.firmId` from authenticated identity.

Every protected query must be tenant-scoped.

```js
Client.findOne({
  _id: clientId,
  firmId: req.user.firmId
});

Document.findOne({
  _id: documentId,
  firmId: req.user.firmId
});

AuditEvent.find({
  documentId,
  firmId: req.user.firmId
});
```

---

## 11. Backend Folder Structure

```text
backend/
└── src/
    ├── config/
    ├── modules/
    │   ├── auth/
    │   ├── firms/
    │   ├── clients/
    │   ├── documents/
    │   ├── reviews/
    │   └── audit/
    ├── middleware/
    │   ├── authenticate.js
    │   ├── authorize.js
    │   ├── tenant.js
    │   └── errorHandler.js
    ├── services/
    │   ├── workflow.service.js
    │   ├── audit.service.js
    │   └── storage.service.js
    ├── routes/
    ├── app.js
    └── server.js
```

Use a modular monolith. Do not split this into microservices.

---

## 12. Frontend Routes

```text
/login
/dashboard
/clients
/clients/:clientId
/documents/:documentId/review
/documents/:documentId/history
```

Core components:

```text
Layout
Sidebar
ProtectedRoute
RoleGuard
ClientCard
DocumentCard
StatusBadge
UploadDialog
ReviewPanel
CorrectionDialog
AuditTimeline
VersionList
```

---

## 13. UI Flow

```text
Login
  ↓
Dashboard
  ↓
Clients
  ↓
Client Workspace
  ↓
Document
  ├── Upload
  ├── Review
  ├── Re-upload
  └── History
```

UI should be professional, operational, readable, status-driven, and simple.

---

## 14. Security Checklist

### Authentication
- Unauthenticated users cannot access protected APIs.
- Invalid credentials are rejected.

### Role authorization
- Staff cannot approve.
- Staff cannot request corrections.
- Reviewer can review, approve, and request corrections.

### Tenant isolation
- Firm A cannot read Firm B clients.
- Firm A cannot read Firm B documents.
- Firm A cannot read Firm B audit events.
- Firm A cannot manipulate Firm B documents.

### Workflow
- Cannot approve pending documents.
- Cannot request correction from pending documents.
- Cannot review already approved documents.
- Cannot re-upload approved documents.
- Correction requires a comment.

### Audit
- Every important mutation creates an audit event.
- Audit events cannot be edited/deleted through normal APIs.

### File upload
- Validate type.
- Validate size.
- Do not trust original filenames.
- Generate safe storage names.

---

## 15. Recommended Demo Scenario

Use one clean story:

```text
Firm: ABC & Co.
Staff: Rohit
Reviewer: Aman
Client: ABC Traders Pvt. Ltd.
Document: Bank Statement
```

Demo:

```text
Rohit logs in
   ↓
Creates ABC Traders
   ↓
Bank Statement appears
   ↓
Rohit uploads v1
   ↓
Aman logs in
   ↓
Starts review
   ↓
Requests correction:
"Page 3 is missing..."
   ↓
Rohit uploads v2
   ↓
Aman reviews v2
   ↓
Aman approves
   ↓
Open Audit History
```

Then demonstrate:

```text
Firm A user
    ↓
attempts Firm B document
    ↓
403/404
```

---

## 16. Architecture Explanation

Use this conceptual architecture:

```text
                    USERS
              Staff / Reviewer
                       │
                       ▼
                React + Vite
                       │
                    REST
                       │
                       ▼
                 Express API
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 Authentication   Authorization    Tenant Isolation
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                 Domain Services
                       │
        ┌──────────────┼───────────────┐
        ▼              ▼               ▼
     Clients       Documents        Reviews
                       │
                       ▼
                 Workflow Engine
                       │
              ┌────────┴────────┐
              ▼                 ▼
          MongoDB          File Storage
              │
              ▼
        Append-only
        Audit Events
```

Key decisions:
1. Modular monolith instead of microservices because the prototype is small.
2. Backend-owned workflow instead of frontend-controlled status.
3. Tenant-scoped queries because frontend restrictions are not security.
4. Document versions preserve corrected submissions.
5. Append-only audit events preserve historical traceability.
6. Human-controlled approval; AI should not make the authoritative approval decision.

---

## 17. Optional AI Feature

Only after the required system works.

A small **AI Review Assistant** can produce observations for the reviewer.

```text
Document
   ↓
AI analysis
   ↓
Suggestions
   ↓
Human Reviewer
   ↓
Approve / Correction
```

AI must not directly approve an audit document.

If it threatens the 6–10 hour scope, skip it.

---

## 18. What Not to Build

Do not spend time on:
- WhatsApp integration
- GST filing
- Tax calculation
- Government portal automation
- OCR pipeline
- Advanced AI agents
- Mobile app
- Payments
- Complex analytics
- Production-grade enterprise authentication
- Microservices
- Kubernetes
- Cloud-scale infrastructure

A complete small system is better than an incomplete large system.

---

## 19. Implementation Order

### Phase 1 — Foundation
1. Create frontend/backend.
2. Configure environment variables.
3. Connect MongoDB.
4. Create models.
5. Seed two firms and demo users.

### Phase 2 — Authentication
6. Implement login.
7. Authentication middleware.
8. Role middleware.
9. `/auth/me`.

### Phase 3 — Tenant Isolation
10. Add `firmId`.
11. Scope all resource queries.
12. Test cross-firm access.

### Phase 4 — Clients
13. Client API.
14. Client list.
15. Client details.
16. Required document initialization.
17. Audit events.

### Phase 5 — Documents
18. Upload.
19. Versions.
20. Status transitions.
21. Upload/re-upload audit events.

### Phase 6 — Review
22. Start review.
23. Approve.
24. Correction.
25. Validate transitions.
26. Audit events.

### Phase 7 — Audit
27. Audit service.
28. Audit history API.
29. Read-only audit history.
30. Timeline UI.

### Phase 8 — Frontend
31. Login.
32. Dashboard.
33. Clients.
34. Client workspace.
35. Upload UI.
36. Review UI.
37. Correction UI.
38. Audit timeline.

### Phase 9 — Hardening
39. Test roles.
40. Test invalid transitions.
41. Test cross-tenant access.
42. Test file validation.
43. Test error handling.

### Phase 10 — Submission
44. Deploy.
45. Screenshots.
46. README.
47. Architecture diagram.
48. Demo video.
49. Fill submission form.
50. Submit before deadline.

---

## 20. Definition of Done

The project is ready when this works without manual database changes:

```text
Rohit logs in
   ↓
Creates ABC Traders
   ↓
Bank Statement appears
   ↓
Rohit uploads v1
   ↓
Aman logs in
   ↓
Starts review
   ↓
Requests correction with reason
   ↓
Rohit logs in
   ↓
Sees correction
   ↓
Uploads v2
   ↓
Aman reviews
   ↓
Approves
   ↓
Audit timeline shows every action
   ↓
Firm B data remains inaccessible
```

---

## 21. Engineering Positioning

The project should communicate:

> I can take a business workflow, model its domain state, enforce authorization at the backend, preserve historical traceability, and ship a usable product quickly.

The strongest technical signals are:

```text
Multi-tenancy
     +
Authorization
     +
State machine
     +
Document versioning
     +
Append-only audit trail
     +
Clean modular architecture
     +
Tests
```

This is the target architecture for the FE-2 evaluation.
