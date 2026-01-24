import {
  ClerkProvider,
} from '@clerk/nextjs'
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'PEI Solar Panel Advisor',
  description: 'Upload a photo of your roof to get personalized solar panel recommendations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-background font-sans antialiased">
          <Navbar />
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
