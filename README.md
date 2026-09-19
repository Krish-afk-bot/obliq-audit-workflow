# OBLIQ Audit Review System (FE-2 Evaluation)

A production-minded, secure, multi-tenant **Audit Document Review & Traceability System** designed for Chartered Accountancy (CA) firms. Built strictly to satisfy and exceed all requirements outlined in the **OBLIQ-in FE-2 Evaluation Blueprint**.

---

## 🌟 Key Highlights & Engineering Highlights

- 🏢 **Strict Multi-Tenant Isolation**: Hard boundary enforcement where every read, query, and mutation is scoped strictly to `req.user.firmId` derived from verified JWT tokens. Client spoofing of `firmId` is completely blocked.
- 🔄 **Deterministic Document State Machine**:
  $$\text{PENDING} \xrightarrow{\text{Upload}} \text{UPLOADED} \xrightarrow{\text{Start Review}} \text{UNDER\_REVIEW} \begin{cases} \xrightarrow{\text{Approve}} \text{APPROVED (Terminal)} \\ \xrightarrow{\text{Request Correction}} \text{CORRECTION\_REQUIRED} \xrightarrow{\text{Re-upload}} \text{UPLOADED} \end{cases}$$
- 🛡️ **Role-Based Authorization (RBAC)**:
  - **STAFF**: Can view firm clients, upload initial documents, and re-upload corrected revisions. Cannot approve or request corrections.
  - **REVIEWER**: Can conduct audit reviews, request corrections (with mandatory reason), and issue certified approvals.
- 📜 **Append-Only Audit History**: Dedicated, immutable audit events ledger (`AuditEvent`). Events are never updated or deleted. Full temporal traceability of actors, actions, timestamps, and metadata.
- 📁 **Non-Destructive Version Preservation**: Multi-version retention where revisions ($v_1, v_2$) are independently archived and queryable behind an abstract storage interface.
- 🇮🇳 **Grounded in Synthetic Indian Financial Datasets**: Integrated sample datasets for Indian CA workflows (HDFC Bank Statements with missing schedules vs reconciled versions, GSTR-1, GSTR-2B, GSTR-3B, Tax Invoices).
- ⚡ **Zero-Config Zero-Setup**: Includes automatic fallback to embedded in-memory MongoDB (`mongodb-memory-server`) if a local MongoDB instance is not active. Runs immediately out of the box!

---

## 🚀 Quick Start (One-Command Setup)

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation
From the project root:
```bash
npm run install:all
```
*(Or `cd backend && npm install && cd ../frontend && npm install`)*

### 3. Run the Full Stack
Start both the Backend API server (Port 5001) and Frontend UI (Port 5173) simultaneously:
```bash
npm run dev
```

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 👥 Pre-Seeded Evaluation Personas

The system includes pre-seeded CA firms and users for instantaneous evaluation. You can sign in using credentials or use the **1-Click Persona Switcher** inside the app.

| Firm Name | Code | User Name | Role | Email | Password |
|:---|:---:|:---|:---:|:---|:---|
| **ABC & Co. Chartered Accountants** (Firm 1) | `ABC-CA` | Rohit Sharma | **STAFF** | `rohit@abcca.com` | `password123` |
| **ABC & Co. Chartered Accountants** (Firm 1) | `ABC-CA` | Aman Verma | **REVIEWER** | `aman@abcca.com` | `password123` |
| **Apex Tax & Audit Advisors** (Firm 2) | `APEX-TAX` | Priya Mehta | **STAFF** | `priya@apex.com` | `password123` |
| **Apex Tax & Audit Advisors** (Firm 2) | `APEX-TAX` | Vikram Malhotra | **REVIEWER** | `vikram@apex.com` | `password123` |

---

## 🧪 Evaluation Walkthrough (12-Step Scenario)

This workflow directly demonstrates the evaluation sequence specified in **Section 15 of `procedure.md`**:

1. **Firm A Staff Login**:
   - Sign in as `rohit@abcca.com` (or click "Rohit (Staff)" preset).
   - Navigate to **Clients & Audits**. Open client **ABC Traders Pvt. Ltd.**
2. **Initial Mandatory Document Schedule**:
   - Observe the 5 required documents auto-initialized in `PENDING` state:
     - Bank Statement
     - Sales Register
     - Purchase Register
     - GST Return
     - Expense Summary
3. **Staff Uploads Document v1**:
   - Click **Upload File** on *Bank Statement*.
   - Click the 1-click synthetic dataset button: **"Bank Statement (v1 with missing schedule)"**.
   - Notice the document status immediately transitions to `UPLOADED (v1)`.
4. **Switch to Reviewer**:
   - Use the top navigation bar dropdown to switch to **Aman Verma (Reviewer)** with 1 click.
   - Notice the review controls are now enabled.
5. **Reviewer Starts Review**:
   - In *Bank Statement*, click **Open Review Panel**.
   - Click **Start Review**. Status transitions from `UPLOADED` to `UNDER_REVIEW`.
6. **Reviewer Requests Correction (Mandatory Reason)**:
   - Click **Request Correction**.
   - Select or type discrepancy note: *"Page 3 quarterly interest & bank charge summary is missing. Please provide complete statement."*
   - Submit. Status transitions from `UNDER_REVIEW` to `CORRECTION_REQUIRED`.
7. **Switch back to Staff & Re-upload (v2)**:
   - Switch back to **Rohit (Staff)**.
   - Notice the prominent discrepancy alert banner showing Aman's requested note.
   - Click **Re-upload Corrected (v2)** and select **"Bank Statement (v2 Corrected with Page 3 schedule)"**.
   - Status transitions back to `UPLOADED (v2)`. Note that $v_1$ is still intact in history!
8. **Reviewer Approves Corrected Document**:
   - Switch back to **Aman (Reviewer)**.
   - Click **Start Review** -> Click **Approve Document**. Add sign-off note: *"Reconciled against GSTR-2B. Certified."*
   - Status locks permanently to `APPROVED`. Edits and further re-uploads are forbidden (terminal state).
9. **Inspect Append-Only Audit Timeline**:
   - Open the **Audit Timeline** tab.
   - Observe the immutable record of:
     - `CLIENT_CREATED`
     - `DOCUMENT_ADDED`
     - `DOCUMENT_UPLOADED` (v1)
     - `REVIEW_STARTED`
     - `CORRECTION_REQUESTED` (with discrepancy reason)
     - `DOCUMENT_REUPLOADED` (v2)
     - `REVIEW_STARTED`
     - `DOCUMENT_APPROVED` (with certification note)
10. **Demonstrate Multi-Tenant Isolation**:
    - Switch to **Priya Mehta (Firm 2 Staff)**.
    - Firm 1's client (ABC Traders) is completely invisible.
    - Open the **Tenant Isolation Demo** tab.
    - Click **Run Security Boundary Test**: The live probe attempts a cross-tenant direct read and a `firmId` body spoofing attack. The backend rejects them with `HTTP 404` and `HTTP 403`, confirming zero data leakage.

---

## 🏗️ Architecture & Engineering Design

```
krishbkl/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & MongoDB auto in-memory fallback
│   │   ├── middleware/      # JWT Authenticate, Role Authorize, Tenant Isolation, Multer
│   │   ├── models/          # Firm, User, Client, Document, DocumentVersion, AuditEvent
│   │   ├── modules/         # Auth, Clients, Documents, Reviews, Audit, Dashboard
│   │   ├── services/        # Workflow state machine, Append-only Audit, Storage
│   │   ├── seed/            # Pre-seeded Indian CA firms, clients & documents
│   │   ├── app.js           # Express app definition
│   │   └── server.js        # Server entrypoint
│   └── tests/               # Jest & Supertest automated test suites
├── frontend/
│   ├── src/
│   │   ├── api/             # HTTP Client with JWT interceptors
│   │   ├── context/         # AuthContext & 1-Click Persona Switcher
│   │   ├── components/      # Modals (Upload, Correction, Approve), Badges, Timeline
│   │   └── pages/           # Dashboard, Clients, Workspace, Document Review, Tenant Demo
│   ├── tailwind.config.js
│   └── vite.config.js       # Proxying /api to port 5001
└── sample-data/             # Synthetic Indian CA financial documents (PDFs & CSVs)
```

### State Machine Transition Rules

| Initial State | Allowed Action | Next State | Authorized Roles |
|:---|:---|:---|:---|
| `PENDING` | Upload File | `UPLOADED` | `STAFF`, `REVIEWER` |
| `UPLOADED` | Start Review | `UNDER_REVIEW` | `REVIEWER` only |
| `UNDER_REVIEW` | Request Correction | `CORRECTION_REQUIRED` | `REVIEWER` only (requires non-empty comment) |
| `UNDER_REVIEW` | Approve Document | `APPROVED` | `REVIEWER` only |
| `CORRECTION_REQUIRED` | Re-upload File | `UPLOADED` | `STAFF`, `REVIEWER` |
| `APPROVED` | *(None)* | **Terminal Locked** | No transitions allowed |

---

## 🔬 Automated Backend Test Suites

The backend includes comprehensive integration test suites covering:
1. **Authentication & Identity**: Token issuance, password hashing, invalid credentials, `/me` endpoint.
2. **Tenant Isolation**: Cross-firm ID lookups return 404, spoofed `firmId` in body returns 403.
3. **Workflow State Transitions & Permissions**:
   - `PENDING -> UNDER_REVIEW` directly is blocked.
   - Staff attempting to approve returns 403.
   - Requesting correction without a comment is blocked with 400.
   - Uploading a revised version preserves version history ($v_1$ and $v_2$ both exist).
   - Once approved, transitions or re-uploads are rejected.
4. **Append-Only Audit Immutability**: All lifecycle actions generate tamper-proof audit records; no modification or deletion routes exist.

To execute the test suites:
```bash
npm test
```
*Result: **23/23 tests passing** across 4 test suites.*

---

## 🛡️ Tenant Isolation & Zero-Trust Guarantees

1. **Token-Derived Authority**: `req.user.firmId` is extracted solely from the cryptographically verified JWT payload and verified in the database. Never trusted from client requests.
2. **Anti-Spoofing Middleware**: Incoming POST/PUT requests are inspected. Any payload supplying a mismatched `firmId` is immediately rejected with `403 Forbidden`.
3. **Mandatory Query Scoping**: Every single database query strictly filters by `{ _id: resourceId, firmId: req.user.firmId }`. A query for a valid ID of another firm evaluates to `null` and safely returns `404 Not Found`.
4. **Tenant-Partitioned Storage**: File uploads are segregated into isolated tenant directories (`uploads/tenants/<firmId>/...`), preventing filesystem collision or cross-tenant reads.

---

## 📈 Production Scaling & Extensibility Roadmap

- **Cloud Object Storage**: The storage layer is abstracted behind `storageService.js`. Switching from local disk to AWS S3 or Google Cloud Storage requires only updating the storage adapter without modifying controllers.
- **Virus / Malware Scanning**: File upload pipeline can integrate ClamAV or AWS GuardDuty hooks inside the multer storage middleware.
- **Granular Client Assignment**: Permissions can be extended to assign specific staff members or partner reviewers to specific clients.
- **Digital Signatures (DSC / eSign)**: For Indian CA audit certification, integrating Aadhaar eSign or Class 3 DSC tokens upon the `APPROVED` state.
