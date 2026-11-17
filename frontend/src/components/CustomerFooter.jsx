import React from 'react';
import DamacoLogo from './DamacoLogo';

const CustomerFooter = () => {
  return (
    <footer className="damaco-customer-footer">
      <div className="customer-footer-inner">
        <div className="footer-left-brand">
          <DamacoLogo size="small" />
          <span className="footer-brand-text">
            Damaco Dirgantara Niaga • Reseller drone B2B Indonesia
          </span>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;

