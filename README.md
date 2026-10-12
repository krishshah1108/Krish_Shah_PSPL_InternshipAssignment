# Expense Voucher Management System

Full-stack web application that digitizes **employee expense voucher creation**, **director approval**, and **accounts review** for reimbursement tracking.

Built for the **Prachay Securities Private Limited** Full Stack Developer Internship assignment.

| Layer | Choice |
|-------|--------|
| Frontend | React (Vite), React Router, responsive UI |
| Backend | Node.js, Express, REST APIs |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt |
| File upload | Cloudinary (employee & director signature images) |

---

## Environment variables (`.env.example`)

Template files live at `server/.env.example` and `client/.env.example`. Copy them to real `.env` files locally and fill in values. **Never commit** `server/.env` or `client/.env` (they contain secrets).

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Server — `server/.env.example`

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=change_this_to_a_long_random_string
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:YOUR_PASSWORD@aws-0-YOUR-REGION.pooler.supabase.com:5432/postgres
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | TCP port for the Express API. Defaults to `5000` if omitted. |
| `CLIENT_ORIGIN` | Yes (for browser use) | `http://localhost:5173` | Allowed CORS origin for the React app. Must match the URL you open in the browser (Vite default is `http://localhost:5173`). |
| `JWT_SECRET` | Yes | long random string | Secret key used to **sign and verify** JWT access tokens after login. Use a long, random value in any shared or production environment. |
| `DATABASE_URL` | Yes | `postgresql://…` | Full PostgreSQL connection string used by `pg` for all queries, `db:setup`, and `seed`. For Supabase, use the **Session pooler** URI (port `5432`) from **Connect** — the direct `db.*.supabase.co` host is IPv6-only and often fails with `ENOTFOUND` on Windows. URL-encode special characters in the password (e.g. `@` → `%40`). |
| `CLOUDINARY_CLOUD_NAME` | Yes (for signatures) | from Cloudinary dashboard | Cloudinary cloud name. Required to upload employee/director signature images. |
| `CLOUDINARY_API_KEY` | Yes (for signatures) | from Cloudinary dashboard | Cloudinary API key paired with the cloud name. |
| `CLOUDINARY_API_SECRET` | Yes (for signatures) | from Cloudinary dashboard | Cloudinary API secret. Keep this private; only the server should use it. |

### Client — `client/.env.example`

```env
VITE_API_URL=/api
```

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No (recommended) | `/api` | Base URL prefix for frontend API calls. In development, keep `/api` so Vite’s proxy forwards requests to `http://localhost:5000`. For a separately hosted API, set the full backend origin (e.g. `https://api.example.com/api`). |

---

## Demo video (optional)

End-to-end walkthrough (Employee → Director → Accounts).

**Watch on Google Drive:** [18-full-project-walkthrough.mp4](https://drive.google.com/file/d/12KOxKEt6Kbww-Jw3lqA3FqqXXk9tzoTc/view?usp=sharing)

Also available in this repo at `project-demo/18-full-project-walkthrough.mp4`:

<video controls width="100%" preload="metadata">
  <source src="project-demo/18-full-project-walkthrough.mp4" type="video/mp4" />
  <source src="https://github.com/krishshah1108/Krish_Shah_PSPL_InternshipAssignment/raw/main/project-demo/18-full-project-walkthrough.mp4" type="video/mp4" />
  Your browser does not support embedded video. Use the
  <a href="https://drive.google.com/file/d/12KOxKEt6Kbww-Jw3lqA3FqqXXk9tzoTc/view?usp=sharing">Google Drive link</a>
  or open
  <a href="project-demo/18-full-project-walkthrough.mp4">project-demo/18-full-project-walkthrough.mp4</a>.
</video>

UI screenshots: [`project-demo/`](project-demo/) (`01-login.png` … `17-accounts-voucher-detail-download.png`).

---

## 1. Project setup instructions

### Prerequisites

- Node.js **18+**
- A PostgreSQL database (Supabase recommended)
- A Cloudinary account (signature image uploads)

### 1.1 Clone and configure environment

```bash
git clone https://github.com/krishshah1108/Krish_Shah_PSPL_InternshipAssignment.git
cd Krish_Shah_PSPL_InternshipAssignment

cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env` and `client/.env` using the variable descriptions in [Environment variables (`.env.example`)](#environment-variables-envexample).

### 1.2 Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 1.3 Create database tables and seed demo users

There is **no public registration**. Apply the schema and seed users once:

```bash
cd server
npm run db:setup
npm run seed
```

Demo logins (users only — no sample vouchers):

| Role | Name | Email | Password |
|------|------|-------|----------|
| Employee | Meet Patel | `meet.patel@abc.com` | `Employee@123` |
| Employee | Sujal Solanki | `sujal.solanki@abc.com` | `Employee@123` |
| Director | Krish Shah | `krish.shah@abc.com` | `Director@123` |
| Accounts | Yamini Gokhle | `yamini.gokhle@abc.com` | `Accounts@123` |

### 1.4 Run the application

**Terminal 1 — API**

```bash
cd server
npm start
```

API: [http://localhost:5000](http://localhost:5000)

**Terminal 2 — UI**

```bash
cd client
npm run dev
```

UI: [http://localhost:5173](http://localhost:5173) (Vite proxies `/api` → `http://localhost:5000`)

| Script | Location | Purpose |
|--------|----------|---------|
| `npm start` | server | Start API |
| `npm run dev` | server | API with nodemon |
| `npm run db:setup` | server | Apply `schema.sql` |
| `npm run seed` | server | Seed demo users |
| `npm run dev` | client | Vite dev server |
| `npm run build` | client | Production build |

> **Dev note:** React `<StrictMode>` runs effects twice in development, so API logs may appear in pairs. Production builds do not.

---

## 2. Database schema explanation

Schema file: [`server/db/schema.sql`](server/db/schema.sql)

The database has two main tables and two enums.

### Enums

| Enum | Values |
|------|--------|
| `user_role` | `EMPLOYEE`, `DIRECTOR`, `ACCOUNTS` |
| `voucher_status` | `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED` |

### Table: `users`

Stores application users. Authentication is handled by the Express API (JWT + bcrypt), **not** Supabase Auth.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Default `gen_random_uuid()` |
| `name` | VARCHAR(150) | Display name |
| `email` | VARCHAR(255) UNIQUE | Login identity |
| `password_hash` | VARCHAR(255) | bcrypt hash |
| `role` | `user_role` | Access control |
| `employee_id` | VARCHAR(50) | Optional employee code |
| `created_at` / `updated_at` | TIMESTAMPTZ | Audit timestamps |

### Table: `vouchers`

Stores expense vouchers and approval metadata. Signature **images** are stored in Cloudinary; only URLs are saved in PostgreSQL.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `voucher_number` | VARCHAR(40) UNIQUE | Auto-generated `VCH-YYYYMMDD-XXXX` |
| `voucher_date` | DATE | Must be **on or before today** (not in the future) |
| `expense_date` | DATE | Must be **on or before** voucher date |
| `department` | VARCHAR(100) | Required |
| `expense_title` | VARCHAR(200) | Required |
| `expense_category` | VARCHAR(100) | Required |
| `expense_description` | TEXT | Optional |
| `amount` | NUMERIC(12,2) | Must be `> 0` |
| `status` | `voucher_status` | Default `DRAFT` |
| `employee_id` | UUID FK → `users` | Owner |
| `employee_signature_url` | TEXT | Required on submit |
| `director_id` | UUID FK → `users` | Set on approve/reject |
| `director_signature_url` | TEXT | Required on approve |
| `approval_date` | TIMESTAMPTZ | Set on approve |
| `rejection_reason` | TEXT | Required on reject |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

Indexes exist on `employee_id`, `status`, `department`, `expense_date`, and `voucher_number`.

### Workflow

```
DRAFT → PENDING_APPROVAL → APPROVED
                        ↘ REJECTED
```

| Role | Capabilities |
|------|----------------|
| Employee | Create / edit / delete **own drafts**; submit with signature |
| Director | View all; approve (signature) or reject (reason) pending vouchers |
| Accounts | View all; download vouchers as PDF; **no** create/edit/approve/reject |

---

## 3. API documentation

**Base URL:** `http://localhost:5000/api`

**Auth header (protected routes):**

```http
Authorization: Bearer <token>
```

**Response envelope:**

```json
{
  "status": 200,
  "message": "…",
  "data": { }
}
```

### 3.1 Auth

| Method | Path | Access | Request body | Response `data` |
|--------|------|--------|--------------|-----------------|
| POST | `/auth/login` | Public | `{ "email", "password" }` | `{ "token", "user" }` |
| GET | `/auth/me` | Auth | — | Current user profile |

### 3.2 Uploads

| Method | Path | Access | Request | Response `data` |
|--------|------|--------|---------|-----------------|
| POST | `/uploads/signature` | Employee, Director | `multipart/form-data` field `signature` | `{ "signatureUrl" }` |

### 3.3 Dashboard

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/dashboard` | Auth | Role-specific stats and recent activity |

### 3.4 Vouchers

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/vouchers/meta/options` | Auth | `{ departments, expenseCategories }` |
| GET | `/vouchers` | Auth | List (employee: own; director/accounts: all) |
| GET | `/vouchers/:id` | Auth | Detail with ownership checks |
| GET | `/vouchers/:id/download` | Accounts | Download voucher as A4 PDF file |
| POST | `/vouchers` | Employee | Create draft |
| PUT | `/vouchers/:id` | Employee | Update own draft |
| DELETE | `/vouchers/:id` | Employee | Delete own draft |
| POST | `/vouchers/:id/submit` | Employee | Body `{ "employeeSignatureUrl" }` |
| POST | `/vouchers/:id/approve` | Director | Body `{ "directorSignatureUrl" }` |
| POST | `/vouchers/:id/reject` | Director | Body `{ "rejectionReason" }` |

**List query parameters**

| Param | Description |
|-------|-------------|
| `search` | Free-text search value |
| `searchBy` | `all` \| `voucherNumber` \| `expenseTitle` \| `employeeName` |
| `department` | Exact department |
| `expenseCategory` | Exact category |
| `status` | `DRAFT` \| `PENDING_APPROVAL` \| `APPROVED` \| `REJECTED` |
| `expenseDateFrom` / `expenseDateTo` | ISO date range |
| `amountMin` / `amountMax` | Amount range |
| `sortBy` | e.g. `createdAt`, `expenseDate`, `amount`, `status`, `voucherNumber`, `expenseTitle`, `employeeName` |
| `sortOrder` | `asc` \| `desc` |

Field names in JSON are **camelCase** (e.g. `expenseCategory`, `employeeSignatureUrl`, `createdAt`).

---

## 4. Assumptions made during development

1. **PostgreSQL via Supabase** is used as a hosted database only; login uses **JWT issued by Express**, not Supabase Auth.
2. Assignment labels “Submitted” / “Pending Approval” are stored as a single status `PENDING_APPROVAL` and shown in the UI as **Pending**.
3. There is **no public self-registration**; users are provisioned with `npm run seed`.
4. Department and expense category values come from **fixed dropdown lists** (not free text).
5. **Accounts** can view vouchers of all statuses and download PDF vouchers, but cannot create, edit, delete, approve, or reject.
6. Signature images are uploaded to **Cloudinary**; only the resulting URL is stored in the database.
7. Voucher numbers follow `VCH-YYYYMMDD-XXXX` with a daily sequence.
8. **Voucher date** must be on or before today (not in the future); **expense date** must be on or before the voucher date (enforced in UI and API).
9. **Search, filter, and sort** on the voucher list are available to **Director** and **Accounts** (bonus). Employees can search their own vouchers.
10. Accounts download (`GET /vouchers/:id/download`) returns a printable A4 PDF voucher (optional bonus).
11. CORS allows the Vite origin from `CLIENT_ORIGIN`; the Vite dev server proxies `/api` to the Express port.

---

## Project structure

```text
/
  client/                 React (Vite) frontend
    .env.example
    src/
      api/                API client
      components/         Shared UI
      context/            Auth & toast
      pages/              Route screens
  server/                 Express API
    .env.example
    db/schema.sql         Database schema
    db/setup.js           Applies schema
    db/seed.js            Demo users
    src/
      routes/             Route definitions
      controllers/        Business logic
      middleware/         Auth, validation, upload, errors
      validators/         express-validator rules
      utils/              Response helpers, voucher PDF, etc.
  project-demo/           UI screenshots + full project walkthrough video
  README.md
```
