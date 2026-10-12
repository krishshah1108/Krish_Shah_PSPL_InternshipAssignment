import { useRef, useState } from 'react';
import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLogIn,
  FiMail,
  FiShield,
  FiUser,
} from 'react-icons/fi';
import { Navigate, useNavigate } from 'react-router-dom';
import CompanyLogo from '../components/CompanyLogo';
import LogoLoader from '../components/LogoLoader';
import { COMPANY_NAME } from '../constants/brand';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEMO_ACCOUNTS = [
  {
    role: 'Employee',
    name: 'Meet Patel',
    email: 'meet.patel@abc.com',
    password: 'Employee@123',
    blurb: 'Create and track expense vouchers',
    icon: FiUser,
  },
  {
    role: 'Employee',
    name: 'Sujal Solanki',
    email: 'sujal.solanki@abc.com',
    password: 'Employee@123',
    blurb: 'Create and track expense vouchers',
    icon: FiUser,
  },
  {
    role: 'Director',
    name: 'Krish Shah',
    email: 'krish.shah@abc.com',
    password: 'Director@123',
    blurb: 'Approve or reject pending vouchers',
    icon: FiShield,
  },
  {
    role: 'Accounts',
    name: 'Yamini Gokhle',
    email: 'yamini.gokhle@abc.com',
    password: 'Accounts@123',
    blurb: 'Monitor and download vouchers',
    icon: FiCheckCircle,
  },
];

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const formTopRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <LogoLoader fullPage label="Checking session…" />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
    toast.success(`Filled ${account.name} credentials.`);
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email is required.');
      return;
    }
    if (!password) {
      toast.error('Password is required.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Signed in successfully.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-hero" aria-label="Product introduction">
          <div className="login-hero-inner">
            <CompanyLogo size="lg" className="login-logo" />
            <p className="login-eyebrow">{COMPANY_NAME}</p>
            <h1>Expense Voucher Management</h1>
            <p className="login-lead">
              Create vouchers, get director approval, and track reimbursements in one place.
            </p>
            <ul className="login-points">
              <li>Draft, submit, and track your claims</li>
              <li>Role-based approval for Director and Accounts</li>
              <li>Secure sign-in — no public registration</li>
            </ul>
          </div>
        </section>

        <section className="login-form-panel">
          <form className="login-form" noValidate onSubmit={handleSubmit}>
            <header ref={formTopRef} className="login-form-head">
              <CompanyLogo size="sm" className="login-form-logo" />
              <h2>Welcome back</h2>
              <p>Sign in with your work account to continue.</p>
            </header>

            <label className="login-field">
              Email
              <div className="input-with-icon">
                <FiMail aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  placeholder="name@company.com"
                />
              </div>
            </label>

            <label className="login-field">
              Password
              <div className="password-row input-with-icon">
                <FiLock aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
              <FiLogIn aria-hidden="true" />
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="demo-box">
              <div className="demo-box-head">
                <h3>Demo accounts</h3>
                <p>Seeded users only — no vouchers. Tap a card to autofill, then sign in.</p>
              </div>
              <div className="demo-grid">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      className="demo-card"
                      onClick={() => fillDemo(account)}
                    >
                      <span className="demo-role">
                        <Icon aria-hidden="true" />
                        {account.role}
                      </span>
                      <span className="demo-name">{account.name}</span>
                      <span className="demo-email">{account.email}</span>
                      <span className="demo-blurb">{account.blurb}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
