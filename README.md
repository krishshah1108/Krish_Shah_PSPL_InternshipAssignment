# Expense Voucher Management System

Full-stack web application that digitizes **employee expense voucher creation**, **director approval**, and **accounts review** for reimbursement tracking.

Built for the **Prachay Securities Private Limited (PSPL)** Full Stack Developer Internship assignment.

| Resource | URL |
|---|---|
| **GitHub Repository** | [krishshah1108/Krish_Shah_PSPL_InternshipAssignment](https://github.com/krishshah1108/Krish_Shah_PSPL_InternshipAssignment) |
| **Live Frontend (Vercel)** | [https://krishshahpsplinternshipassignment-c.vercel.app](https://krishshahpsplinternshipassignment-c.vercel.app) |
| **Live API (Render)** | [https://krish-shah-pspl-internshipassignment.onrender.com](https://krish-shah-pspl-internshipassignment.onrender.com) |
| **Demo Walkthrough Video** | [Watch on Google Drive](https://drive.google.com/file/d/12KOxKEt6Kbww-Jw3lqA3FqqXXk9tzoTc/view?usp=sharing) |

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite, React Router v6 | Responsive UI with custom design tokens, debounced search, modals, and toasts |
| **Backend** | Node.js, Express.js | Layered REST API with request logging, rate limiting, and centralized error handling |
| **Database** | PostgreSQL (Supabase) | Relational schema with status enums, foreign keys, and indexed queries |
| **Auth** | JWT + bcrypt | Role-based token authentication with hashed credentials |
| **File Uploads** | Cloudinary | Cloud storage for employee and director digital signature images |
| **PDF Generation** | PDFKit | Printable, branded A4 voucher document exports |

---

## Role-Based Workflow

```text
[ DRAFT ] ──(Submit + Employee Signature)──► [ PENDING_APPROVAL ]
                                                    │
                   ┌────────────────────────────────┴────────────────────────────────┐
                   ▼                                                                 ▼
      [ APPROVED + Director Signature ]                                [ REJECTED + Reason ]
                   │                                                                 │
      (Accounts Review & PDF Export)                                   (Employee Views Feedback)
```

| Role | Permissions & Capabilities |
|---|---|
| **Employee** | Create, edit, and delete **own draft** vouchers; upload signature and submit for approval; track voucher status; view rejection reasons. |
| **Director** | View all company vouchers; review pending submissions; approve vouchers (with digital signature) or reject vouchers (with mandatory reason). |
| **Accounts** | View all vouchers organization-wide; search, filter, and sort reimbursements; download printable A4 PDF vouchers. |

---

## Quickstart & Setup Instructions

### Prerequisites
- **Node.js 18+**
- **PostgreSQL database** (e.g. Supabase session pooler)
- **Cloudinary account** (for signature image uploads)

### 1. Clone & Configure Environment

```bash
git clone https://github.com/krishshah1108/Krish_Shah_PSPL_InternshipAssignment.git
cd Krish_Shah_PSPL_InternshipAssignment

# Copy environment templates
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 3. Initialize Database & Seed Users

There is **no public self-registration**. Run the database migrations and seed script once:

```bash
cd server
npm run db:setup
npm run seed
```

#### Demo Credentials (Pre-seeded)

| Role | Full Name | Email | Password |
|---|---|---|---|
| **Employee** | Meet Patel | `meet.patel@abc.com` | `Employee@123` |
| **Employee** | Sujal Solanki | `sujal.solanki@abc.com` | `Employee@123` |
| **Director** | Krish Shah | `krish.shah@abc.com` | `Director@123` |
| **Accounts** | Yamini Gokhle | `yamini.gokhle@abc.com` | `Accounts@123` |

### 4. Run the Application

```bash
# Terminal 1 — Start Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Start Client (runs on http://localhost:5173)
cd client
npm run dev
```

*Note: In development, the Vite dev server automatically proxies `/api` requests to `http://localhost:5000`.*

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | Express server port (defaults to `5000`) | `5000` |
| `CLIENT_ORIGIN` | Yes | Allowed frontend origin(s) for CORS | `http://localhost:5173,https://krishshahpsplinternshipassignment-c.vercel.app` |
| `JWT_SECRET` | Yes | Secret key for signing session tokens | `your_jwt_secret_key` |
| `DATABASE_URL` | Yes | PostgreSQL connection string (Supabase Session Pooler port 5432) | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `CLOUDINARY_CLOUD_NAME`| Yes | Cloudinary cloud identifier | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API access key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Yes | Cloudinary secret key | `your_api_secret` |

### Client (`client/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | API base path (`/api` in dev; full Render URL in prod) | `/api` |

---

## Database Schema

Database definitions located at [`server/db/schema.sql`](server/db/schema.sql).

### Tables

#### `users`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | UUID | Primary Key, `gen_random_uuid()` |
| `name` | VARCHAR(150) | User full name |
| `email` | VARCHAR(255) | Unique, user login handle |
| `password_hash` | VARCHAR(255) | Bcrypt hash (10 salt rounds) |
| `role` | `user_role` | Enum: `'EMPLOYEE'`, `'DIRECTOR'`, `'ACCOUNTS'` |
| `employee_id` | VARCHAR(50) | Optional employee identifier |
| `created_at` / `updated_at` | TIMESTAMPTZ | Audit timestamps |

#### `vouchers`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | UUID | Primary Key |
| `voucher_number` | VARCHAR(40) | Unique auto-generated identifier (`VCH-YYYYMMDD-XXXX`) |
| `voucher_date` | DATE | Date created (must be $\le$ current date) |
| `expense_date` | DATE | Date expense occurred (must be $\le$ `voucher_date`) |
| `department` | VARCHAR(100) | Department name from fixed options |
| `expense_title` | VARCHAR(200) | Short expense title |
| `expense_category` | VARCHAR(100) | Category from fixed options |
| `expense_description` | TEXT | Optional details |
| `amount` | NUMERIC(12,2)| Expense amount (must be $> 0$) |
| `status` | `voucher_status` | Enum: `'DRAFT'`, `'PENDING_APPROVAL'`, `'APPROVED'`, `'REJECTED'` |
| `employee_id` | UUID | Foreign Key $\rightarrow$ `users.id` |
| `employee_signature_url` | TEXT | Cloudinary URL (required before submission) |
| `director_id` | UUID | Foreign Key $\rightarrow$ `users.id` (set upon approval/rejection) |
| `director_signature_url` | TEXT | Cloudinary URL (required upon approval) |
| `approval_date` | TIMESTAMPTZ | Timestamp recorded on approval |
| `rejection_reason` | TEXT | Mandatory justification when rejected |
| `created_at` / `updated_at` | TIMESTAMPTZ | Audit timestamps |

---

## API Reference

**Base URL:** `http://localhost:5000/api` (Production: `https://krish-shah-pspl-internshipassignment.onrender.com/api`)  
**Standard Response Envelope:**
```json
{
  "status": 200,
  "message": "Operation successful message.",
  "data": { ... }
}
```

---

### Endpoints Overview

| Module | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | Public | API liveness + `SELECT 1` DB probe (login wake-up & twice-daily cron) |
| **Auth** | `POST` | `/auth/login` | Public | Authenticate user & return JWT token |
| | `GET` | `/auth/me` | Authenticated | Retrieve profile for authenticated token |
| **Uploads**| `POST` | `/uploads/signature`| Employee, Director | Upload base64/file signature to Cloudinary |
| **Dashboard**| `GET`| `/dashboard` | Authenticated | Role-customized statistics and KPIs |
| **Vouchers**| `GET` | `/vouchers` | Authenticated | List vouchers with multi-field search, filters, sort |
| | `GET` | `/vouchers/meta/options` | Authenticated | Dropdown lists (departments, expense categories) |
| | `GET` | `/vouchers/:id` | Authenticated | Get complete voucher details by ID |
| | `POST`| `/vouchers` | Employee | Create a new voucher draft |
| | `PUT` | `/vouchers/:id` | Employee | Update an existing draft voucher |
| | `DELETE`| `/vouchers/:id` | Employee | Delete an existing draft voucher |
| | `POST`| `/vouchers/:id/submit` | Employee | Submit draft for approval with employee signature |
| | `POST`| `/vouchers/:id/approve` | Director | Approve voucher with director signature |
| | `POST`| `/vouchers/:id/reject` | Director | Reject voucher with mandatory reason |
| | `GET` | `/vouchers/:id/download`| Accounts | Download voucher as printable A4 PDF |

---

### Detailed Endpoint Specifications

#### 1. System Health Check
- **Endpoint:** `GET /health`
- **Access:** Public (No authentication required)
- **Description:** Verifies the API is up and runs `SELECT 1` against Postgres so free-tier Supabase registers activity. Called on login page load (Render wake-up) and by a GitHub Actions cron twice daily (`.github/workflows/keep-alive.yml`).

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/health"
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "ok": true,
    "service": "expense-voucher-api",
    "database": "up"
  }
}
```

**Response (`503` when the database is unreachable):**
```json
{
  "status": 503,
  "message": "Database unavailable.",
  "data": null
}
```

---

#### 2. User Login
- **Endpoint:** `POST /auth/login`
- **Access:** Public
- **Description:** Authenticates user credentials via bcrypt comparison and issues an 8-hour JWT token.

**Request Headers:** `Content-Type: application/json`  
**Request Body:**
```json
{
  "email": "meet.patel@abc.com",
  "password": "Employee@123"
}
```

**cURL Command:**
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"meet.patel@abc.com","password":"Employee@123"}'
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Signed in successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e2a1b3c4-1234-5678-9abc-def012345678",
      "name": "Meet Patel",
      "email": "meet.patel@abc.com",
      "role": "EMPLOYEE",
      "employeeId": "EMP-101"
    }
  }
}
```

---

#### 3. Current User Profile
- **Endpoint:** `GET /auth/me`
- **Access:** Authenticated (`EMPLOYEE`, `DIRECTOR`, `ACCOUNTS`)
- **Description:** Returns profile details of the user associated with the provided JWT bearer token.

**Request Headers:** `Authorization: Bearer <TOKEN>`

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/auth/me" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "User profile fetched successfully.",
  "data": {
    "id": "e2a1b3c4-1234-5678-9abc-def012345678",
    "name": "Meet Patel",
    "email": "meet.patel@abc.com",
    "role": "EMPLOYEE",
    "employeeId": "EMP-101"
  }
}
```

---

#### 4. Digital Signature Upload
- **Endpoint:** `POST /uploads/signature`
- **Access:** Authenticated (`EMPLOYEE`, `DIRECTOR`)
- **Description:** Uploads signature image buffer (`image/png`, `image/jpeg`, `image/webp`) to Cloudinary and returns a secure HTTPS URL.

**Request Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: multipart/form-data`  
**Request Payload:** Form-data field `signature` containing image binary.

**cURL Command:**
```bash
curl -X POST "http://localhost:5000/api/uploads/signature" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "signature=@/path/to/signature.png"
```

**Response (`201 Created`):**
```json
{
  "status": 201,
  "message": "Signature uploaded successfully.",
  "data": {
    "signatureUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/expense-vouchers/signatures/sample.png"
  }
}
```

---

#### 5. Role-Based Dashboard Statistics
- **Endpoint:** `GET /dashboard`
- **Access:** Authenticated (`EMPLOYEE`, `DIRECTOR`, `ACCOUNTS`)
- **Description:** Delivers dynamic analytical metrics tailored to the requesting user's role.
  - **Employee:** Total claim counts, status breakdowns, total claimed amount.
  - **Director:** Pending approvals count, today's approvals/rejections, total pending amount, recent activity feed.
  - **Accounts:** Organization-wide totals, total approved reimbursement amount, recent approved vouchers feed.

**Request Headers:** `Authorization: Bearer <TOKEN>`

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/dashboard" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (`200 OK` - Employee Example):**
```json
{
  "status": 200,
  "message": "Dashboard data fetched successfully.",
  "data": {
    "totalVouchers": 12,
    "draftVouchers": 3,
    "pendingApproval": 4,
    "approvedVouchers": 4,
    "rejectedVouchers": 1,
    "totalAmountClaimed": 42500.50
  }
}
```

---

#### 6. Form Metadata Options
- **Endpoint:** `GET /vouchers/meta/options`
- **Access:** Authenticated (`EMPLOYEE`, `DIRECTOR`, `ACCOUNTS`)
- **Description:** Returns the official lists of departments and expense categories for dropdown selections.

**Request Headers:** `Authorization: Bearer <TOKEN>`

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/vouchers/meta/options" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Options fetched successfully.",
  "data": {
    "departments": [
      "Executive",
      "Finance & Accounts",
      "Information Technology",
      "Human Resources",
      "Operations",
      "Sales & Marketing",
      "Legal & Compliance"
    ],
    "expenseCategories": [
      "Travel & Conveyance",
      "Client Entertainment & Meals",
      "Office Supplies & Stationery",
      "Hardware & IT Equipment",
      "Software & Cloud Subscriptions",
      "Training & Professional Development",
      "Telecom & Internet",
      "Miscellaneous"
    ]
  }
}
```

---

#### 7. List Vouchers (Search, Filter, Sort)
- **Endpoint:** `GET /vouchers`
- **Access:** Authenticated
  - **Employee:** Automatically restricted to own submitted/draft vouchers.
  - **Director / Accounts:** Global access to all organization vouchers.
- **Query Parameters:**
  - `search` (string): Keyword search.
  - `searchBy` (string): Search field scope (`all`, `voucherNumber`, `expenseTitle`, `employeeName`).
  - `department` (string): Exact department match.
  - `expenseCategory` (string): Exact expense category match.
  - `status` (string): Filter by status (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`).
  - `expenseDateFrom` / `expenseDateTo` (YYYY-MM-DD): Filter by expense date range.
  - `amountMin` / `amountMax` (number): Filter by expense amount range.
  - `sortBy` (string): Sort column (`createdAt`, `expenseDate`, `amount`, `status`, `voucherNumber`, `expenseTitle`, `employeeName`).
  - `sortOrder` (string): `asc` or `desc` (default: `desc`).

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/vouchers?status=PENDING_APPROVAL&department=Information%20Technology&sortBy=amount&sortOrder=desc" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Vouchers fetched successfully.",
  "data": [
    {
      "id": "c1f2e3d4-4567-89ab-cdef-0123456789ab",
      "voucherNumber": "VCH-20261012-0004",
      "voucherDate": "2026-10-12",
      "expenseDate": "2026-10-10",
      "department": "Information Technology",
      "expenseTitle": "AWS Cloud Hosting Infrastructure",
      "expenseCategory": "Software & Cloud Subscriptions",
      "expenseDescription": "Monthly production database and API hosting fees.",
      "amount": 18450.00,
      "status": "PENDING_APPROVAL",
      "employeeId": "e2a1b3c4-1234-5678-9abc-def012345678",
      "employeeName": "Meet Patel",
      "employeeCode": "EMP-101",
      "employeeSignatureUrl": "https://res.cloudinary.com/.../signature.png",
      "directorId": null,
      "directorName": null,
      "directorSignatureUrl": null,
      "approvalDate": null,
      "rejectionReason": null,
      "createdAt": "2026-10-12T10:30:00.000Z",
      "updatedAt": "2026-10-12T11:00:00.000Z"
    }
  ]
}
```

---

#### 8. Get Voucher Details
- **Endpoint:** `GET /vouchers/:id`
- **Access:** Authenticated (Employees can only view their own vouchers; Director/Accounts can view any).
- **Description:** Returns complete voucher details including approval timestamps, signatures, and rejection remarks.

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/vouchers/c1f2e3d4-4567-89ab-cdef-0123456789ab" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Voucher fetched successfully.",
  "data": {
    "id": "c1f2e3d4-4567-89ab-cdef-0123456789ab",
    "voucherNumber": "VCH-20261012-0004",
    "voucherDate": "2026-10-12",
    "expenseDate": "2026-10-10",
    "department": "Information Technology",
    "expenseTitle": "AWS Cloud Hosting Infrastructure",
    "expenseCategory": "Software & Cloud Subscriptions",
    "expenseDescription": "Monthly production database and API hosting fees.",
    "amount": 18450.00,
    "status": "APPROVED",
    "employeeId": "e2a1b3c4-1234-5678-9abc-def012345678",
    "employeeName": "Meet Patel",
    "employeeCode": "EMP-101",
    "employeeSignatureUrl": "https://res.cloudinary.com/.../employee_sig.png",
    "directorId": "d3b2a1c0-9876-5432-1fed-cba987654321",
    "directorName": "Krish Shah",
    "directorSignatureUrl": "https://res.cloudinary.com/.../director_sig.png",
    "approvalDate": "2026-10-12T14:20:00.000Z",
    "rejectionReason": null,
    "createdAt": "2026-10-12T10:30:00.000Z",
    "updatedAt": "2026-10-12T14:20:00.000Z"
  }
}
```

---

#### 9. Create Draft Voucher
- **Endpoint:** `POST /vouchers`
- **Access:** Authenticated (`EMPLOYEE` only)
- **Description:** Generates a sequential voucher number and creates a voucher record in `DRAFT` status.

**Request Body:**
```json
{
  "voucherDate": "2026-10-12",
  "expenseDate": "2026-10-11",
  "department": "Sales & Marketing",
  "expenseTitle": "Client Lunch Meeting",
  "expenseCategory": "Client Entertainment & Meals",
  "expenseDescription": "Quarterly portfolio review lunch with key investors.",
  "amount": 3450.00
}
```

**cURL Command:**
```bash
curl -X POST "http://localhost:5000/api/vouchers" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "voucherDate": "2026-10-12",
    "expenseDate": "2026-10-11",
    "department": "Sales & Marketing",
    "expenseTitle": "Client Lunch Meeting",
    "expenseCategory": "Client Entertainment & Meals",
    "expenseDescription": "Quarterly portfolio review lunch with key investors.",
    "amount": 3450.00
  }'
```

**Response (`201 Created`):**
```json
{
  "status": 201,
  "message": "Voucher saved as draft successfully.",
  "data": {
    "id": "a9b8c7d6-e5f4-3210-fedc-ba9876543210",
    "voucherNumber": "VCH-20261012-0005",
    "voucherDate": "2026-10-12",
    "expenseDate": "2026-10-11",
    "department": "Sales & Marketing",
    "expenseTitle": "Client Lunch Meeting",
    "expenseCategory": "Client Entertainment & Meals",
    "amount": 3450.00,
    "status": "DRAFT",
    "employeeId": "e2a1b3c4-1234-5678-9abc-def012345678"
  }
}
```

---

#### 10. Update Draft Voucher
- **Endpoint:** `PUT /vouchers/:id`
- **Access:** Authenticated (`EMPLOYEE` only)
- **Description:** Modifies expense details of an existing voucher. The voucher must belong to the employee and must be in `DRAFT` status.

**Request Body:**
```json
{
  "voucherDate": "2026-10-12",
  "expenseDate": "2026-10-11",
  "department": "Sales & Marketing",
  "expenseTitle": "Client Business Lunch & Parking",
  "expenseCategory": "Client Entertainment & Meals",
  "expenseDescription": "Included parking pass fee along with investor meal.",
  "amount": 3750.00
}
```

**cURL Command:**
```bash
curl -X PUT "http://localhost:5000/api/vouchers/a9b8c7d6-e5f4-3210-fedc-ba9876543210" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "voucherDate": "2026-10-12",
    "expenseDate": "2026-10-11",
    "department": "Sales & Marketing",
    "expenseTitle": "Client Business Lunch & Parking",
    "expenseCategory": "Client Entertainment & Meals",
    "expenseDescription": "Included parking pass fee along with investor meal.",
    "amount": 3750.00
  }'
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Draft voucher updated successfully.",
  "data": {
    "id": "a9b8c7d6-e5f4-3210-fedc-ba9876543210",
    "voucherNumber": "VCH-20261012-0005",
    "amount": 3750.00,
    "status": "DRAFT"
  }
}
```

---

#### 11. Delete Draft Voucher
- **Endpoint:** `DELETE /vouchers/:id`
- **Access:** Authenticated (`EMPLOYEE` only)
- **Description:** Permanently removes a voucher. Permitted only if the voucher is in `DRAFT` status and owned by the employee.

**cURL Command:**
```bash
curl -X DELETE "http://localhost:5000/api/vouchers/a9b8c7d6-e5f4-3210-fedc-ba9876543210" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Voucher deleted successfully.",
  "data": null
}
```

---

#### 12. Submit Voucher for Approval
- **Endpoint:** `POST /vouchers/:id/submit`
- **Access:** Authenticated (`EMPLOYEE` only)
- **Description:** Attaches mandatory employee signature URL and transitions status from `DRAFT` $\rightarrow$ `PENDING_APPROVAL`. Once submitted, the voucher becomes read-only for the employee.

**Request Body:**
```json
{
  "employeeSignatureUrl": "https://res.cloudinary.com/demo/image/upload/signatures/emp_sign_123.png"
}
```

**cURL Command:**
```bash
curl -X POST "http://localhost:5000/api/vouchers/a9b8c7d6-e5f4-3210-fedc-ba9876543210/submit" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"employeeSignatureUrl":"https://res.cloudinary.com/demo/image/upload/signatures/emp_sign_123.png"}'
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Voucher submitted for approval.",
  "data": {
    "id": "a9b8c7d6-e5f4-3210-fedc-ba9876543210",
    "status": "PENDING_APPROVAL",
    "employeeSignatureUrl": "https://res.cloudinary.com/demo/image/upload/signatures/emp_sign_123.png"
  }
}
```

---

#### 13. Director Voucher Approval
- **Endpoint:** `POST /vouchers/:id/approve`
- **Access:** Authenticated (`DIRECTOR` only)
- **Description:** Approves a pending voucher, attaching the director's digital signature URL, recording the approval timestamp, and advancing status to `APPROVED`.

**Request Body:**
```json
{
  "directorSignatureUrl": "https://res.cloudinary.com/demo/image/upload/signatures/dir_sign_456.png"
}
```

**cURL Command:**
```bash
curl -X POST "http://localhost:5000/api/vouchers/a9b8c7d6-e5f4-3210-fedc-ba9876543210/approve" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"directorSignatureUrl":"https://res.cloudinary.com/demo/image/upload/signatures/dir_sign_456.png"}'
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Voucher approved successfully.",
  "data": {
    "id": "a9b8c7d6-e5f4-3210-fedc-ba9876543210",
    "status": "APPROVED",
    "directorId": "d3b2a1c0-9876-5432-1fed-cba987654321",
    "directorSignatureUrl": "https://res.cloudinary.com/demo/image/upload/signatures/dir_sign_456.png",
    "approvalDate": "2026-10-12T16:45:00.000Z"
  }
}
```

---

#### 14. Director Voucher Rejection
- **Endpoint:** `POST /vouchers/:id/reject`
- **Access:** Authenticated (`DIRECTOR` only)
- **Description:** Rejects a pending voucher with a mandatory reason. Transitions status to `REJECTED`, allowing the employee to view feedback.

**Request Body:**
```json
{
  "rejectionReason": "Itemized tax invoice is missing. Please attach original vendor receipt."
}
```

**cURL Command:**
```bash
curl -X POST "http://localhost:5000/api/vouchers/a9b8c7d6-e5f4-3210-fedc-ba9876543210/reject" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason":"Itemized tax invoice is missing. Please attach original vendor receipt."}'
```

**Response (`200 OK`):**
```json
{
  "status": 200,
  "message": "Voucher rejected successfully.",
  "data": {
    "id": "a9b8c7d6-e5f4-3210-fedc-ba9876543210",
    "status": "REJECTED",
    "directorId": "d3b2a1c0-9876-5432-1fed-cba987654321",
    "rejectionReason": "Itemized tax invoice is missing. Please attach original vendor receipt."
  }
}
```

---

#### 15. Download Printable Voucher PDF
- **Endpoint:** `GET /vouchers/:id/download`
- **Access:** Authenticated (`ACCOUNTS` only)
- **Description:** Dynamically streams a professionally styled A4 PDF document containing official Prachay Securities branding, complete voucher details, and embedded signatures for reimbursement settlement.

**Request Headers:** `Authorization: Bearer <TOKEN>`  
**Response Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="VCH-20261012-0004.pdf"`

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/vouchers/c1f2e3d4-4567-89ab-cdef-0123456789ab/download" \
  -H "Authorization: Bearer <TOKEN>" \
  -o "voucher_download.pdf"
```

**Response Binary:** Streams PDF file stream (`200 OK`).

---

## Assumptions & Design Decisions

1. **Self-Registration**: Public signup is disabled to replicate internal corporate environments; accounts are seeded via `npm run seed`.
2. **State Management**: The workflow states "Submitted" and "Pending Approval" are unified under `PENDING_APPROVAL` and labeled as **Pending** in the user interface.
3. **Data Integrity**: Vouchers cannot have a future date. The expense date must precede or match the voucher date.
4. **Signature Storage**: Digital signatures are stored securely on Cloudinary; PostgreSQL stores only validated HTTPS asset URLs.
5. **Printable Output**: PDF export uses vector layout with company branding, audit tables, and embedded digital signatures for accounts settlement.
6. **Free-Tier Optimization**: Login page calls `/api/health` to wake a sleeping Render API. That same route runs `SELECT 1` so Supabase sees DB traffic. A GitHub Action (`.github/workflows/keep-alive.yml`) pings health twice daily (`0 0,12 * * *` UTC) to reduce free-plan DB auto-pause risk.

---

## Project Structure

```text
/
├── client/                     # React (Vite) frontend application
│   ├── src/
│   │   ├── api/                # Axios API client and interceptors
│   │   ├── components/         # Shared UI (Navigation, Tables, Modals, Filters)
│   │   ├── context/            # Global Auth and Toast notification state
│   │   ├── pages/              # Route views (Dashboard, List, Form, Details, Login)
│   │   └── utils/              # Formatting and date helpers
│   └── vercel.json             # Vercel SPA routing rewrites
├── server/                     # Express.js REST API
│   ├── db/
│   │   ├── schema.sql          # PostgreSQL DDL script
│   │   ├── setup.js            # Migration executor
│   │   └── seed.js             # Demo accounts generator
│   └── src/
│       ├── config/             # Database and Cloudinary configuration
│       ├── controllers/        # Business logic controllers
│       ├── middleware/         # Auth, validation, upload, and error handling
│       ├── routes/             # Route endpoint definitions
│       └── utils/              # PDF generator, voucher numbering, logger
├── project-demo/               # Demo screenshots and walkthrough video
└── README.md
```

---

## Acknowledgment

Developed for the **Prachay Securities Private Limited (PSPL)** Full Stack Developer Internship Evaluation.
