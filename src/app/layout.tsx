import {
  ClerkProvider,
} from '@clerk/nextjs'
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const theme = localStorage.getItem('solarpei-theme') || 'system';
                  const isDark = theme === 'dark' ||
                    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider>
            <Navbar />
            <main>
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
