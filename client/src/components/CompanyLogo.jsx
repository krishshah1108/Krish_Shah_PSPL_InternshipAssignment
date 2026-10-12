import { COMPANY_NAME, LOGO_SRC } from '../constants/brand';

export default function CompanyLogo({ className = '', size = 'sm' }) {
  return (
    <img
      src={LOGO_SRC}
      alt={`${COMPANY_NAME} logo`}
      className={`company-logo company-logo-${size} ${className}`.trim()}
    />
  );
}
