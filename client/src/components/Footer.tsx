import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground">
      <p>
        All data from 2016 up to August 2025 is from{' '}
        <a
          href="https://apps2.dpwh.gov.ph/infra_projects/default.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          https://apps2.dpwh.gov.ph/infra_projects/default.aspx
        </a>
      </p>
    </footer>
  );
};

export default Footer;
