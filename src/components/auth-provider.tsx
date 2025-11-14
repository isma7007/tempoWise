"use client"

import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar, SidebarInset, SidebarProvider } from "./ui/sidebar";
import SideNav from "./side-nav";
import { AppHeader } from "./app-header";
import { Loader2 } from "lucide-react";

const protectedRoutes = ["/", "/activities", "/goals", "/settings", "/statistics"];
const authRoutes = ["/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isUserLoading) return; // Wait until user status is resolved

        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) && (route.length === 1 || pathname.length === route.length || pathname[route.length] === '/'));
        const isAuthRoute = authRoutes.includes(pathname);

        if (!user && isProtectedRoute) {
            router.push('/login');
        }

        if (user && isAuthRoute) {
            router.push('/');
        }

    }, [user, isUserLoading, pathname, router]);
    
    // While checking user auth, show a loading screen.
    if (isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) && (route.length === 1 || pathname.length === route.length || pathname[route.length] === '/'));
    
    // If we have a user and they are on a protected route, render the app layout
    if (user && isProtectedRoute) {
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
    
    // For auth pages or if user is not logged in on a public page
    return <>{children}</>;
}
