import { useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLogIn,
  FiMail,
  FiRefreshCw,
  FiShield,
  FiUser,
} from 'react-icons/fi';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import CompanyLogo from '../components/CompanyLogo';
import LogoLoader from '../components/LogoLoader';
import { COMPANY_NAME } from '../constants/brand';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const HEALTH_TIMEOUT_MS = 90_000;

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
  const [serverStatus, setServerStatus] = useState('checking'); // checking | ready | error
  const [healthError, setHealthError] = useState('');
  const [healthAttempt, setHealthAttempt] = useState(0);

  useEffect(() => {
    if (loading || user) return undefined;

    let cancelled = false;
    let timedOut = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, HEALTH_TIMEOUT_MS);

    setServerStatus('checking');
    setHealthError('');

    api
      .health({ signal: controller.signal })
      .then(() => {
        if (!cancelled) setServerStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (timedOut || err?.name === 'AbortError') {
          setHealthError(
            'The server is taking longer than expected to wake up. Please try again.'
          );
        } else {
          setHealthError(
            err?.message ||
              'We could not reach the server. It may be starting up — please try again.'
          );
        }
        setServerStatus('error');
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [loading, user, healthAttempt]);

  if (loading) {
    return <LogoLoader fullPage label="Checking session…" />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const serverReady = serverStatus === 'ready';
  const formLocked = !serverReady;

  function fillDemo(account) {
    if (formLocked) return;
    setEmail(account.email);
    setPassword(account.password);
    toast.success(`Filled ${account.name} credentials.`);
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formLocked) return;
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
          <div className="login-form-stage">
            {serverStatus === 'checking' ? (
              <div className="login-wakeup" role="status" aria-live="polite">
                <LogoLoader label="Getting things ready for you…" />
                <p className="login-wakeup-note">
                  Connecting to the server — this may take a moment the first time.
                </p>
              </div>
            ) : null}

            {serverStatus === 'error' ? (
              <div className="login-wakeup login-wakeup-error" role="alert">
                <span className="login-wakeup-icon" aria-hidden="true">
                  <FiAlertCircle />
                </span>
                <h2>Almost there</h2>
                <p>{healthError}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setHealthAttempt((n) => n + 1)}
                >
                  <FiRefreshCw aria-hidden="true" />
                  Try again
                </button>
              </div>
            ) : null}

            <form
              className={`login-form${formLocked ? ' login-form-locked' : ''}`}
              noValidate
              aria-busy={serverStatus === 'checking'}
              onSubmit={handleSubmit}
            >
              <header ref={formTopRef} className="login-form-head">
                <CompanyLogo size="sm" className="login-form-logo" />
                <h2>Welcome back</h2>
                <p>Sign in with your work account to continue.</p>
              </header>

              <fieldset disabled={formLocked} className="login-fieldset">
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

                <button
                  type="submit"
                  className="btn btn-primary login-submit"
                  disabled={submitting || formLocked}
                >
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
                          disabled={formLocked}
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
              </fieldset>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
