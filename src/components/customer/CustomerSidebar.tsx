"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  CalendarCheck,
  History,
  CircleOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const customerNavItems = [
  { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/customer/appointments", icon: CalendarCheck },
  { label: "Previous appointments", href: "/customer/appointments/history", icon: History },
  { label: "Canceled appointments", href: "/customer/appointments/canceled", icon: CircleOff },
];

type CustomerSidebarProps = {
  customerName: string;
  customerEmail: string;
  initials: string;
  onLogout: () => void;
};

export const CustomerSidebar = ({ customerName, customerEmail, initials, onLogout }: CustomerSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="order-2 bg-background/90 border-t border-border px-6 py-6 lg:order-1 lg:border-t-0 lg:border-r lg:min-h-screen flex flex-col">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Premier Pro Cleaners</p>
        <p className="text-sm text-muted-foreground">Customer Portal</p>
      </div>
      <nav className="flex flex-row gap-2 overflow-x-auto pb-4 lg:flex-col lg:gap-3 lg:pb-6 flex-1">
        {customerNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-primary/10",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <DropdownMenu>
        <DropdownMenuTrigger className="border-t border-border pt-4 text-left focus:outline-none">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{customerName}</p>
              <p className="text-xs text-muted-foreground">{customerEmail}</p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/customer/profile">Profile Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault();
              onLogout();
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
};
