import { useState } from 'react';
import {
  FiCheckSquare,
  FiFileText,
  FiHome,
  FiLogOut,
  FiPlusCircle,
} from 'react-icons/fi';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME, COMPANY_SHORT } from '../constants/brand';
import { useAuth } from '../context/AuthContext';
import CompanyLogo from './CompanyLogo';
import ConfirmModal from './ConfirmModal';

const PENDING_VOUCHERS = '/vouchers?status=PENDING_APPROVAL';

function isVoucherListPath(pathname) {
  if (pathname === '/vouchers') return true;
  if (pathname === '/vouchers/new' || pathname.endsWith('/edit')) return false;
  return /^\/vouchers\/[^/]+$/.test(pathname);
}

function isPendingList(pathname, search) {
  return (
    pathname === '/vouchers' &&
    new URLSearchParams(search).get('status') === 'PENDING_APPROVAL'
  );
}

const NAV = {
  EMPLOYEE: [
    { to: '/', label: 'Dashboard', end: true, icon: FiHome },
    { to: '/vouchers', label: 'My Vouchers', icon: FiFileText, match: 'voucher-list' },
    { to: '/vouchers/new', label: 'Create Voucher', end: true, icon: FiPlusCircle },
  ],
  DIRECTOR: [
    { to: '/', label: 'Dashboard', end: true, icon: FiHome },
    { to: PENDING_VOUCHERS, label: 'Pending', end: true, icon: FiCheckSquare, match: 'pending' },
    { to: '/vouchers', label: 'All Vouchers', icon: FiFileText, match: 'voucher-list' },
  ],
  ACCOUNTS: [
    { to: '/', label: 'Dashboard', end: true, icon: FiHome },
    { to: '/vouchers', label: 'All Vouchers', icon: FiFileText, match: 'voucher-list' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const links = NAV[user.role];

  function confirmLogout() {
    setLogoutOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <CompanyLogo />
          <div>
            <p className="brand-title">{APP_NAME}</p>
            <p className="brand-sub">{COMPANY_SHORT}</p>
          </div>
        </div>
        <nav className="nav-links" aria-label="Main">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => {
                  let active = isActive;
                  if (link.match === 'pending') {
                    active = isPendingList(pathname, search);
                  } else if (link.match === 'voucher-list') {
                    active = isVoucherListPath(pathname) && !isPendingList(pathname, search);
                  }
                  return active ? 'nav-link active' : 'nav-link';
                }}
              >
                <Icon aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="user-chip">
          <div>
            <p className="user-name">{user.name}</p>
            <p className="user-role">{user.role}</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setLogoutOpen(true)}>
            <FiLogOut aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>

      <ConfirmModal
        open={logoutOpen}
        title="Sign out?"
        message="You will need to sign in again to access your vouchers."
        confirmLabel="Logout"
        cancelLabel="Stay signed in"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
