import { useState } from 'react';

const logoUrl = `${import.meta.env.BASE_URL}branding/hanana-academy-logo.png`;

export function CompanyBrand({ variant = 'footer' }) {
  const [failed, setFailed] = useState(false);

  return <div className={`company-brand company-brand--${variant}`}>
    <span className="company-brand__label">Dibangunkan oleh</span>
    <span className="company-brand__art">
      {failed
        ? <span className="company-brand__fallback">Hanana Academy</span>
        : <img src={logoUrl} width="375" height="181" alt="Hanana Academy"
          onError={() => setFailed(true)} />}
    </span>
  </div>;
}
