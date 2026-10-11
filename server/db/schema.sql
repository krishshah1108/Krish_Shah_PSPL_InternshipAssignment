CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE voucher_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  employee_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number VARCHAR(40) NOT NULL UNIQUE,
  voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_date DATE NOT NULL,
  department VARCHAR(100) NOT NULL,
  expense_title VARCHAR(200) NOT NULL,
  expense_category VARCHAR(100) NOT NULL,
  expense_description TEXT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status voucher_status NOT NULL DEFAULT 'DRAFT',
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  employee_signature_url TEXT,
  director_id UUID REFERENCES users(id) ON DELETE SET NULL,
  director_signature_url TEXT,
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_employee_id ON vouchers(employee_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_department ON vouchers(department);
CREATE INDEX IF NOT EXISTS idx_vouchers_expense_date ON vouchers(expense_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_number ON vouchers(voucher_number);
