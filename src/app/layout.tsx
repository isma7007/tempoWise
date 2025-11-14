import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import SideNav from '@/components/side-nav';
import { AppHeader } from '@/components/app-header';
import { FirebaseClientProvider } from '@/firebase';
import { AuthProvider } from '@/components/auth-provider';
import { FocusModeProvider } from '@/context/focus-mode-context';

export const metadata: Metadata = {
  title: 'TempoWise',
  description: 'Track your productivity and gain insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <FocusModeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </FocusModeProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
