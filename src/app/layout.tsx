import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import SideNav from '@/components/side-nav';
import { AppHeader } from '@/components/app-header';

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
        <SidebarProvider>
            <Sidebar>
                <SideNav />
            </Sidebar>
            <SidebarInset className="bg-background/80">
                <div className="flex flex-col h-full">
                    <AppHeader />
                    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
