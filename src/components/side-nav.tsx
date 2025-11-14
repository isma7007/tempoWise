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
        <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent-foreground" />
            <h1 className="text-xl font-semibold">TempoWise</h1>
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
