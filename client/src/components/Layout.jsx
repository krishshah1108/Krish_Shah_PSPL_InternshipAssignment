import { useEffect, useId, useState } from 'react';
import {
  FiCheckSquare,
  FiFileText,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPlusCircle,
  FiX,
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

function navClassName(link, pathname, search) {
  return ({ isActive }) => {
    let active = isActive;
    if (link.match === 'pending') {
      active = isPendingList(pathname, search);
    } else if (link.match === 'voucher-list') {
      active = isVoucherListPath(pathname) && !isPendingList(pathname, search);
    }
    return active ? 'nav-link active' : 'nav-link';
  };
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname, search } = location;
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const links = NAV[user.role];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('nav-lock');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('nav-lock');
    };
  }, [menuOpen]);

  function confirmLogout() {
    setLogoutOpen(false);
    setMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  const navLinks = links.map((link) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={navClassName(link, pathname, search)}
        onClick={() => setMenuOpen(false)}
      >
        <Icon aria-hidden="true" />
        <span>{link.label}</span>
      </NavLink>
    );
  });

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-bar">
          <div className="brand-block">
            <CompanyLogo />
            <div>
              <p className="brand-title">{APP_NAME}</p>
              <p className="brand-sub">{COMPANY_SHORT}</p>
            </div>
          </div>

          <nav className="nav-links nav-desktop" aria-label="Main">
            {navLinks}
          </nav>

          <div className="user-chip user-desktop">
            <div className="user-meta">
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role}</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost logout-btn"
              onClick={() => setLogoutOpen(true)}
            >
              <FiLogOut aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>

        {menuOpen ? (
          <button
            type="button"
            className="nav-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        <div
          id={menuId}
          className={`mobile-drawer${menuOpen ? ' open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <div className="mobile-drawer-user">
            <div className="user-meta">
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
          <nav className="mobile-drawer-nav" aria-label="Mobile">
            {navLinks}
          </nav>
          <button
            type="button"
            className="btn btn-ghost mobile-logout-btn"
            onClick={() => {
              setMenuOpen(false);
              setLogoutOpen(true);
            }}
          >
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
