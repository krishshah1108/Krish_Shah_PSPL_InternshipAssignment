import { LOGO_TRANSPARENT_SRC } from '../constants/brand';

export default function LogoLoader({ label = 'Loading…', fullPage = false }) {
  return (
    <div
      className={fullPage ? 'logo-loader logo-loader-full' : 'logo-loader'}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <img
        src={LOGO_TRANSPARENT_SRC}
        alt=""
        className="logo-loader-img"
        aria-hidden="true"
      />
      <span className="logo-loader-label">{label}</span>
    </div>
  );
}
