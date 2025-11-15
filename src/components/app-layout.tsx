'use client';

import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar, SidebarInset, SidebarProvider } from './ui/sidebar';
import SideNav from './side-nav';
import { AppHeader } from './app-header';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { seedInitialData } from '@/app/data/operations';
import { useFocusMode } from '@/context/focus-mode-context';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const { isFocusMode } = useFocusMode();
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is resolved
    }

    if (!user) {
      router.push('/login');
      return;
    }

    // User is logged in, check if they have been seeded
    const checkAndSeedUser = async () => {
      if (!firestore) return;

      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists() || !userDoc.data()?.seeded) {
          await seedInitialData(user.uid, firestore);
        }
      } catch (error) {
        console.error("Error during seeding check:", error);
      } finally {
        setIsSeeding(false);
      }
    };

    checkAndSeedUser();
  }, [user, isUserLoading, firestore, router]);

  if (isUserLoading || isSeeding) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        {isSeeding && !isUserLoading && <p className="ml-4">Preparing your account...</p>}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SideNav />
      </Sidebar>
      <SidebarInset className={`bg-background/80 transition-filter duration-300 ${isFocusMode ? 'filter blur-sm' : ''}`}>
        <div className="flex flex-col h-full">
          <AppHeader />
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
