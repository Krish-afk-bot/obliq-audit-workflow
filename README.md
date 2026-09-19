# OBLIQ Audit Review System

**A secure, multi-tenant Audit Document Review & Traceability System designed for Chartered Accountancy (CA) firms.**

The prototype demonstrates document workflow management, role-based authorization, tenant isolation, document versioning, and append-only audit traceability.

## Engineering Approach

- **Modular monolith**: Clean separation of routes, controllers, and services.
- **Backend-enforced authorization**: Strict role checks (`STAFF`, `REVIEWER`) at the API level.
- **Firm-level tenant isolation**: Every query is securely scoped to the authenticated user's `firmId`.
- **Explicit document state machine**: Deterministic state transitions from `PENDING` to `APPROVED`.
- **Document version preservation**: Non-destructive updates where all uploaded revisions are preserved.
- **Append-only audit events**: Tamper-proof history tracking for all critical workflow actions.
- **Simple storage abstraction**: Abstracted local storage interface, ready for cloud integration.
- **Automated backend integration tests**: Comprehensive test coverage across security boundaries and workflow rules.

## Key Features

- **Strict Multi-Tenant Isolation**: Hard boundary enforcement where every read, query, and mutation is scoped strictly to `req.user.firmId` derived from verified JWT tokens. Client spoofing of `firmId` is completely blocked.
- **Role-Based Authorization (RBAC)**:
  - **STAFF**: Can view firm clients, upload initial documents, and re-upload corrected revisions. Cannot approve or request corrections.
  - **REVIEWER**: Can conduct audit reviews, request corrections (with mandatory reason), and issue certified approvals.
- **Append-Only Audit History**: Dedicated, immutable audit events ledger (`AuditEvent`). Events are never updated or deleted. Full temporal traceability of actors, actions, timestamps, and metadata.
- **Non-Destructive Version Preservation**: Multi-version retention where revisions (v1, v2) are independently archived and queryable behind an abstract storage interface.
- **Grounded in Synthetic Indian Financial Datasets**: Integrated sample datasets for Indian CA workflows.
- **Zero-Config Zero-Setup**: Includes automatic fallback to embedded in-memory MongoDB (`mongodb-memory-server`) if a local MongoDB instance is not active. Runs immediately out of the box!

## Architecture

```text
backend/
├── src/
│   ├── config/          # Environment & MongoDB auto in-memory fallback
│   ├── middleware/      # JWT Authenticate, Role Authorize, Tenant Isolation
│   ├── models/          # Firm, User, Client, Document, DocumentVersion, AuditEvent
│   ├── modules/         # Auth, Clients, Documents, Reviews, Audit, Dashboard
│   ├── services/        # Workflow state machine, Append-only Audit, Storage
│   ├── seed/            # Pre-seeded Indian CA firms, clients & documents
│   ├── app.js           # Express app definition
│   └── server.js        # Server entrypoint
└── tests/               # Jest & Supertest automated test suites

frontend/
├── src/
│   ├── api/             # HTTP Client with JWT interceptors
│   ├── context/         # AuthContext & 1-Click Persona Switcher
│   ├── components/      # Reusable UI components
│   └── pages/           # Application views
├── tailwind.config.js
└── vite.config.js       # Proxying /api to backend

sample-data/             # Synthetic Indian CA financial documents
```

## Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation
From the project root:
```bash
npm run install:all
```

### 3. Run the Full Stack
Start both the Backend API server (Port 5001) and Frontend UI (Port 5173) simultaneously:
```bash
npm run dev
```

Open your browser at: [http://localhost:5173](http://localhost:5173)

## Evaluation Credentials

> **Evaluation-only seeded credentials. These accounts and passwords are synthetic and intended only for local evaluation.**

| Firm Name | Code | User Name | Role | Email | Password |
|---|---|---|---|---|---|
| ABC & Co. Chartered Accountants | `ABC-CA` | Rohit Sharma | STAFF | `rohit@abcca.com` | `password123` |
| ABC & Co. Chartered Accountants | `ABC-CA` | Aman Verma | REVIEWER | `aman@abcca.com` | `password123` |
| Apex Tax & Audit Advisors | `APEX-TAX` | Priya Mehta | STAFF | `priya@apex.com` | `password123` |
| Apex Tax & Audit Advisors | `APEX-TAX` | Vikram Malhotra | REVIEWER | `vikram@apex.com` | `password123` |

## Evaluation Walkthrough

1. **Firm A Staff Login**: Sign in as `rohit@abcca.com` (or click "Rohit (Staff)" preset). Navigate to **Clients & Audits**. Open client **ABC Traders Pvt. Ltd.**
2. **Initial Mandatory Document Schedule**: Observe the 5 required documents auto-initialized in `PENDING` state (Bank Statement, Sales Register, Purchase Register, GST Return, Expense Summary).
3. **Staff Uploads Document v1**: Click **Upload File** on *Bank Statement*. Click the 1-click synthetic dataset button: **"Bank Statement (v1 with missing schedule)"**. Notice the document status immediately transitions to `UPLOADED (v1)`.
4. **Switch to Reviewer**: Use the top navigation bar dropdown to switch to **Aman Verma (Reviewer)** with 1 click.
5. **Reviewer Starts Review**: In *Bank Statement*, click **Open Review Panel**. Click **Start Review**. Status transitions from `UPLOADED` to `UNDER_REVIEW`.
6. **Reviewer Requests Correction**: Click **Request Correction**. Select or type discrepancy note: *"Page 3 quarterly interest & bank charge summary is missing. Please provide complete statement."* Submit. Status transitions from `UNDER_REVIEW` to `CORRECTION_REQUIRED`.
7. **Staff Re-upload (v2)**: Switch back to **Rohit (Staff)**. Click **Re-upload Corrected (v2)** and select **"Bank Statement (v2 Corrected with Page 3 schedule)"**. Status transitions back to `UPLOADED (v2)`. Note that v1 is still intact in history!
8. **Reviewer Approves Corrected Document**: Switch back to **Aman (Reviewer)**. Click **Start Review** -> Click **Approve Document**. Add sign-off note. Status locks permanently to `APPROVED`.
9. **Inspect Append-Only Audit Timeline**: Open the **Audit Timeline** tab. Observe the immutable record of events.
10. **Demonstrate Multi-Tenant Isolation**: Switch to **Priya Mehta (Firm 2 Staff)**. Firm 1's client (ABC Traders) is completely invisible. Open the **Tenant Isolation Demo** tab. Click **Run Security Boundary Test**.

## What This Demonstrates

```text
Business workflow modeling
        +
Role-based authorization
        +
Multi-tenant security
        +
Document versioning
        +
Audit traceability
        +
Backend integration testing
```

This prototype focuses on the core workflow requested by the evaluation rather than unrelated platform features.

## Document Workflow

```text
PENDING
   ↓ Upload
UPLOADED
   ↓ Start Review
UNDER_REVIEW
   ├── Approve → APPROVED (Terminal)
   │
   └── Request Correction
          ↓
   CORRECTION_REQUIRED
          ↓ Re-upload
       UPLOADED
```

### State Machine Transition Rules

| Initial State | Allowed Action | Next State | Authorized Roles |
|---|---|---|---|
| `PENDING` | Upload File | `UPLOADED` | STAFF, REVIEWER |
| `UPLOADED` | Start Review | `UNDER_REVIEW` | REVIEWER only |
| `UNDER_REVIEW` | Request Correction | `CORRECTION_REQUIRED` | REVIEWER only (requires non-empty comment) |
| `UNDER_REVIEW` | Approve Document | `APPROVED` | REVIEWER only |
| `CORRECTION_REQUIRED` | Re-upload File | `UPLOADED` | STAFF, REVIEWER |
| `APPROVED` | *(None)* | **Terminal Locked** | No transitions allowed |

## Multi-Tenant Security

### Authentication
The user is identified securely through a verified JWT token.

### Authorization
The assigned Role (`STAFF`, `REVIEWER`) determines which actions the user can perform.

### Tenant Isolation
Firm identity comes entirely from the server-verified JWT (`req.user.firmId`) rather than trusting a client-supplied `firmId`. Every database resource query is strictly scoped by the authenticated user's firm. The included security-boundary test verifies that cross-tenant resource access and `firmId` spoofing attempts are rejected by the backend.

## Audit Trail & Versioning

### Audit Trail
Audit events have no normal update/delete routes and are treated as append-only application records. The timeline cleanly shows:
- **Who** performed the action
- **What** action occurred
- **When** the event happened
- **Which document** was affected
- **Why** (comments or discrepancy reasons)

### Document Versioning
```text
Bank Statement
├── v1 → Correction Required
└── v2 → Approved
```
A corrected submission does not overwrite the previous submission. Each uploaded revision remains independently traceable.

## Testing

To execute the test suites:
```bash
npm test
```
*Result: **23/23 tests passing** across 4 test suites.*

## Project Structure
*(Covered in Architecture)*

## Future Improvements

- **Cloud Object Storage**: Abstracted storage adapter for AWS S3 or Google Cloud Storage.
- **Virus / Malware Scanning**: Integration with ClamAV or AWS GuardDuty hooks.
- **Digital Signatures (DSC / eSign)**: Integration with Aadhaar eSign or Class 3 DSC tokens for certification.

## AI Tools Used

- **ChatGPT**: Architecture discussion, debugging assistance, documentation refinement
- **Cursor**: Implementation support

### How AI Was Used
AI tools were used as development assistants for architecture exploration, debugging, implementation support, and documentation. All generated suggestions were reviewed and integrated manually.
