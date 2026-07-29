import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'omg draft',
  description: 'Draft OMG (OpenAPI Markdown Grammar) specs and preview the compiled OpenAPI 3.1 live',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
