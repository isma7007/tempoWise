import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AuthProvider } from '@/components/auth-provider';
import { FocusModeProvider } from '@/context/focus-mode-context';
import { Inter, Sora } from 'next/font/google';

const fontSora = Sora({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});


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
      <body className={`font-body antialiased ${fontInter.variable} ${fontSora.variable}`}>
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
