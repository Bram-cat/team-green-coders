import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solar Panel Advisor',
  description: 'Upload a photo of your roof to get personalized solar panel recommendations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
