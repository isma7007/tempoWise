"use client"

import { useUser, useFirebase } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar, SidebarInset, SidebarProvider } from "./ui/sidebar";
import SideNav from "./side-nav";
import { AppHeader } from "./app-header";
import { Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { seedInitialData } from "@/app/data/operations";
import { useFocusMode } from "@/context/focus-mode-context";

const protectedRoutes = ["/", "/activities", "/goals", "/settings", "/statistics"];
const authRoutes = ["/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { isFocusMode } = useFocusMode();
    const pathname = usePathname();
    const router = useRouter();
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        if (isUserLoading) return; // Wait until user status is resolved

        const handleUserSession = async () => {
            const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) && (route.length === 1 || pathname.length === route.length || pathname[route.length] === '/'));
            const isAuthRoute = authRoutes.includes(pathname);

            if (!user) {
                if (isProtectedRoute) {
                    router.push('/login');
                }
                return;
            }

            // If user is logged in, check if they have been seeded
            if (firestore) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists() || !userDoc.data()?.seeded) {
                    setIsSeeding(true);
                    try {
                        await seedInitialData(user.uid, firestore);
                    } finally {
                        setIsSeeding(false);
                    }
                }
            }

            if (isAuthRoute) {
                router.push('/');
            }
        };

        handleUserSession();

    }, [user, isUserLoading, pathname, router, firestore]);

    if (isUserLoading || isSeeding) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                {isSeeding && <p className="ml-4">Preparing your account...</p>}
            </div>
        )
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) && (route.length === 1 || pathname.length === route.length || pathname[route.length] === '/'));
    
    if (user && isProtectedRoute) {
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
        )
    }
    
    return <>{children}</>;
}
