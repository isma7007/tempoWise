"use client"

import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar, SidebarInset, SidebarProvider } from "./ui/sidebar";
import SideNav from "./side-nav";
import { AppHeader } from "./app-header";

const protectedRoutes = ["/", "/activities", "/goals", "/settings", "/statistics"];
const authRoutes = ["/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isUserLoading) return;

        const isProtectedRoute = protectedRoutes.includes(pathname);
        const isAuthRoute = authRoutes.includes(pathname);

        if (!user && isProtectedRoute) {
            router.push('/login');
        }

        if (user && isAuthRoute) {
            router.push('/');
        }

    }, [user, isUserLoading, pathname, router]);

    if (isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    if (protectedRoutes.includes(pathname)) {
        return (
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
        )
    }

    return <>{children}</>;
}
