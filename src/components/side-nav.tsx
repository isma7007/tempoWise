"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutGrid, ListTodo, Settings, Target, Zap } from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/activities", label: "Activities", icon: ListTodo },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
];

const bottomLinks = [
    { href: "/settings", label: "Settings", icon: Settings },
]

export default function SideNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="w-5 h-5" />
            </div>
            <h1 className="font-headline text-lg font-semibold text-primary-foreground">TempoWise</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === link.href}
                  className="w-full justify-start"
                >
                  <div>
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <Separator className="my-2"/>
         <SidebarMenu>
            {bottomLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                    <Link href={link.href} passHref>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === link.href}
                          className="w-full justify-start"
                        >
                          <div>
                            <link.icon className="h-4 w-4 mr-2" />
                            {link.label}
                          </div>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
