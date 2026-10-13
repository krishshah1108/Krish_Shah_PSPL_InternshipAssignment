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

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Include header `Authorization: Bearer <token>` on protected routes.

### Endpoints Overview

| Module | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | Public | Service health & Render wake-up probe |
| **Auth** | `POST` | `/auth/login` | Public | Authenticate user & return JWT token |
| | `GET` | `/auth/me` | Authenticated | Retrieve current user profile |
| **Uploads**| `POST` | `/uploads/signature`| Employee / Director | Upload signature image buffer to Cloudinary |
| **Dashboard**| `GET`| `/dashboard` | Authenticated | Role-customized statistics and KPIs |
| **Vouchers**| `GET` | `/vouchers` | Authenticated | List vouchers with search, filters, and sort |
| | `GET` | `/vouchers/meta/options` | Authenticated | Dropdown lists (departments, categories) |
| | `GET` | `/vouchers/:id` | Authenticated | Get full voucher details by ID |
| | `POST`| `/vouchers` | Employee | Create a new voucher draft |
| | `PUT` | `/vouchers/:id` | Employee | Update an existing draft |
| | `DELETE`| `/vouchers/:id` | Employee | Delete an existing draft |
| | `POST`| `/vouchers/:id/submit` | Employee | Submit draft for approval with signature |
| | `POST`| `/vouchers/:id/approve` | Director | Approve voucher with director signature |
| | `POST`| `/vouchers/:id/reject` | Director | Reject voucher with mandatory reason |
| | `GET` | `/vouchers/:id/download`| Accounts | Download printable A4 PDF voucher |

---

## Assumptions & Design Decisions

1. **Self-Registration**: Public signup is disabled to replicate internal corporate environments; accounts are seeded via `npm run seed`.
2. **State Management**: The workflow states "Submitted" and "Pending Approval" are unified under `PENDING_APPROVAL` and labeled as **Pending** in the user interface.
3. **Data Integrity**: Vouchers cannot have a future date. The expense date must precede or match the voucher date.
4. **Signature Storage**: Digital signatures are stored securely on Cloudinary; PostgreSQL stores only validated HTTPS asset URLs.
5. **Printable Output**: PDF export uses vector layout with company branding, audit tables, and embedded digital signatures for accounts settlement.
6. **Free-Tier Optimization**: Frontend automatically calls `/api/health` upon loading the login page to spin up sleeping backend dynos on Render.

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
