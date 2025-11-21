'use client';

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  UserCog,
  UserPlus,
  Megaphone,
  BarChart3,
  FileText,
  User,
  ChevronDown,
  Layout,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/orbit.png";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail, setAdminEmail] = useState("Admin");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSettingsPath = pathname?.startsWith("/admin/settings") ?? false;
  const [settingsOpen, setSettingsOpen] = useState(isSettingsPath);
  const isAccountPath = pathname?.startsWith("/admin/settings/account") ?? false;
  const [accountOpen, setAccountOpen] = useState(isAccountPath);
  const isIndustriesPath = pathname?.startsWith("/admin/settings/industries") ?? false;
  const [industriesOpen, setIndustriesOpen] = useState(isIndustriesPath);
  const isMarketingPath = pathname?.startsWith("/admin/marketing") ?? false;
  const [marketingOpen, setMarketingOpen] = useState(isMarketingPath);
  const [industries, setIndustries] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; description: string; read?: boolean }[]
  >([
    { id: '1', title: 'New booking confirmed', description: 'Booking BK005 has been confirmed.' },
    { id: '2', title: 'Provider completed job', description: 'Provider marked BK003 as completed.', read: true },
    { id: '3', title: 'Cancellation request', description: 'Customer requested to cancel BK004.' },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAllNotifications = () => setNotifications([]);
  const [openIndustryMenus, setOpenIndustryMenus] = useState<Record<string, boolean>>({});

  // Get admin email from localStorage on client-side only
  useEffect(() => {
    const email = localStorage.getItem("adminEmail") || "Admin";
    setAdminEmail(email);
    try {
      const stored = JSON.parse(localStorage.getItem("industries") || "[]");
      if (Array.isArray(stored)) setIndustries(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setSettingsOpen(isSettingsPath);
  }, [isSettingsPath]);

  useEffect(() => {
    setMarketingOpen(isMarketingPath);
  }, [isMarketingPath]);

  useEffect(() => {
    setAccountOpen(isAccountPath);
  }, [isAccountPath]);

  useEffect(() => {
    setIndustriesOpen(isIndustriesPath);
  }, [isIndustriesPath]);

  // keep industries state in sync with localStorage changes made on Industries page
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'industries') {
        try {
          const v = JSON.parse(e.newValue || '[]');
          if (Array.isArray(v)) setIndustries(v);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    const interval = setInterval(() => {
      // poll as well because same-tab updates won't fire 'storage'
      try {
        const v = JSON.parse(localStorage.getItem('industries') || '[]');
        if (Array.isArray(v)) setIndustries(v);
      } catch {}
    }, 1000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    { icon: UserCog, label: "Providers", path: "/admin/providers" },
    { icon: UserPlus, label: "Hiring", path: "/admin/hiring" },
    {
      icon: Megaphone,
      label: "Marketing",
      path: "/admin/marketing",
      children: [
        { label: "Coupons", path: "/admin/marketing/coupons" },
        { label: "Daily Discounts", path: "/admin/marketing/daily-discounts" },
        { label: "Gift Card", path: "/admin/marketing/gift-cards" },
      ],
    },
    { icon: BarChart3, label: "Reports", path: "/admin/reports" },
    { icon: FileText, label: "Logs", path: "/admin/logs" },
    // { icon: Briefcase, label: "Services", path: "/admin/services" },
    {
      icon: Settings,
      label: "Settings",
      path: "/admin/settings",
      children: [
        {
          label: "Account",
          path: "/admin/settings/account",
          children: [
            { label: "Your info", path: "/admin/settings/account/your-info" },
            { label: "Earn Rewards", path: "/admin/settings/account/earn-rewards" },
            { label: "Billing", path: "/admin/settings/account/billing" },
            { label: "Subscription plans", path: "/admin/settings/account/subscription-plans" },
            { label: "Invoices", path: "/admin/settings/account/invoices" },
          ],
        },
        { label: "Design Forms & Website", path: "/admin/settings/design" },
        {
          label: "Industries",
          path: "/admin/settings/industries",
          children: [
            { label: 'Add Industries', path: '/admin/settings/industries' },
            ...(industries || []).map((name) => ({
              label: name,
              path: `/admin/settings/industries?industry=${encodeURIComponent(name)}`,
              children: [
                { 
                  label: 'Form 1', 
                  path: `/admin/settings/industries/form-1?industry=${encodeURIComponent(name)}`,
                  children: [
                    { label: '1. Locations', path: `/admin/settings/industries/form-1/locations?industry=${encodeURIComponent(name)}` },
                    { label: '2. Frequencies', path: `/admin/settings/industries/form-1/frequencies?industry=${encodeURIComponent(name)}` },
                    { label: '3. Service Category', path: `/admin/settings/industries/form-1/service-category?industry=${encodeURIComponent(name)}` },
                    { label: '4. Pricing Parameter', path: `/admin/settings/industries/form-1/pricing-parameter?industry=${encodeURIComponent(name)}` },
                    { label: '5. Extras', path: `/admin/settings/industries/form-1/extras?industry=${encodeURIComponent(name)}` },
                    { label: '6. Custom Sections', path: `/admin/settings/industries/form-1/custom-sections?industry=${encodeURIComponent(name)}` },
                  ]
                },
                { label: 'Settings', path: `/admin/settings/industries/settings?industry=${encodeURIComponent(name)}` },
              ],
            })),
          ],
        },
      ],
    },
  ];

  const handleLogout = () => {
    // Clear authentication
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminEmail");
    }
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-border shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-start justify-between p-4 border-b border-border">
            {sidebarOpen ? (
              <>
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-3">
                    <Image src={logo} alt="Logo" width={44} height={44} className="rounded" />
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Orbit Booking</h2>
                      <p className="text-xs text-muted-foreground">Admin Panel</p>
                    </div>
                  </div>
                  <Separator className="bg-border/80" />
                  <Button
                    className="w-full text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)" }}
                    onClick={() => router.push("/admin/add-booking")}
                  >
                    Add Booking
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="h-8 w-8 mx-auto"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = Array.isArray((item as any).children);
              const childActive = hasChildren
                ? (item as any).children.some((child: { path: string }) => pathname === child.path)
                : false;
              const isExpanded = hasChildren
                ? item.label === "Settings"
                  ? settingsOpen
                  : item.label === "Marketing"
                  ? marketingOpen
                  : false
                : false;
              const isActive = hasChildren ? pathname === item.path && !childActive : pathname === item.path;
              const shouldHighlight = hasChildren && item.label === "Settings"
                ? isActive
                : isActive;

              return (
                <div key={item.path}>
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!sidebarOpen) return;
                        if (item.label === "Settings") {
                          setSettingsOpen((prev) => !prev);
                        }
                        if (item.label === "Marketing") {
                          setMarketingOpen((prev) => !prev);
                        }
                      }}
                      className={`relative flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        shouldHighlight
                          ? "text-white shadow-lg"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      style={shouldHighlight ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                          <ChevronDown
                            className={`absolute right-3 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      onClick={() => { setSettingsOpen(false); setMarketingOpen(false); }}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "text-white shadow-lg"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {shouldHighlight && <ChevronRight className="h-4 w-4" />}
                        </>
                      )}
                    </Link>
                  )}

                  {hasChildren && sidebarOpen && isExpanded && (
                    <div className="mt-1 space-y-1">
                      {(item as any).children.map((child: any) => {
                        const childHasChildren = Array.isArray(child.children);
                        const childActive = pathname === child.path;
                        const grandchildActive = childHasChildren
                          ? child.children.some((gc: { path: string }) => pathname === gc.path)
                          : false;
                        if (childHasChildren) {
                          return (
                            <div key={child.path}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.label === "Settings" && child.label === "Account") {
                                    setAccountOpen((prev) => !prev);
                                  }
                                  if (item.label === "Settings" && child.label === "Industries") {
                                    setIndustriesOpen((prev) => !prev);
                                  }
                                }}
                                className={`relative flex w-full items-center gap-2 rounded-lg py-2 pl-8 pr-3 text-sm transition-all ${
                                  (item.label === 'Settings' && child.label === 'Industries')
                                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    : (childActive || grandchildActive
                                      ? "text-white shadow"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground")
                                }`}
                                style={(item.label === 'Settings' && child.label === 'Industries')
                                  ? {}
                                  : (childActive || grandchildActive ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {})}
                              >
                                <span className="flex-1 text-left">{child.label}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${
                                  (child.label === 'Account' && accountOpen) || (child.label === 'Industries' && industriesOpen)
                                    ? 'rotate-180'
                                    : ''
                                }`} />
                              </button>
                              {(child.label === 'Account' ? accountOpen : child.label === 'Industries' ? industriesOpen : false) && (
                                <div className="mt-1 space-y-1">
                                  {child.children.map((gc: any) => {
                                    const gcHasChildren = Array.isArray(gc.children);
                                    const gcActive = pathname === gc.path;
                                    const isAddIndustries = gc.label === 'Add Industries';
                                    const addIndustriesActive = isAddIndustries && pathname === '/admin/settings/industries' && !searchParams.get('industry');
                                    if (gcHasChildren) {
                                      const key = gc.path as string;
                                      const open = !!openIndustryMenus[key];
                                      return (
                                        <div key={gc.path}>
                                          <button
                                            type="button"
                                            onClick={() => setOpenIndustryMenus((m) => ({ ...m, [key]: !open }))}
                                            className={`relative flex w-full items-center gap-2 rounded-lg py-2 pl-12 pr-3 text-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground`}
                                            style={{}}
                                          >
                                            <span className="flex-1 text-left">{gc.label}</span>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                                          </button>
                                          {open && (
                                            <div className="mt-1 space-y-1">
                                              {gc.children.map((ggc: any) => {
                                                const ggcHasChildren = Array.isArray(ggc.children);
                                                const ggcActive = pathname === ggc.path;
                                                if (ggcHasChildren) {
                                                  const subKey = ggc.path as string;
                                                  const subOpen = !!openIndustryMenus[subKey];
                                                  return (
                                                    <div key={ggc.path}>
                                                      <button
                                                        type="button"
                                                        onClick={() => setOpenIndustryMenus((m) => ({ ...m, [subKey]: !subOpen }))}
                                                        className={`relative flex w-full items-center gap-2 rounded-lg py-2 pl-16 pr-3 text-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground`}
                                                        style={{}}
                                                      >
                                                        <span className="flex-1 text-left">{ggc.label}</span>
                                                        <ChevronDown className={`h-4 w-4 transition-transform ${subOpen ? 'rotate-180' : ''}`} />
                                                      </button>
                                                      {subOpen && (
                                                        <div className="mt-1 space-y-1">
                                                          {ggc.children.map((gggc: { label: string; path: string }) => {
                                                            const gggcBase = (gggc.path || '').split('?')[0];
                                                            const gggcActive = pathname === gggcBase;
                                                            return (
                                                              <Link
                                                                key={gggc.path}
                                                                href={gggc.path}
                                                                className={`relative flex items-center rounded-lg py-2 pl-20 pr-3 text-sm transition-all ${
                                                                  gggcActive ? 'text-white shadow' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                                }`}
                                                                style={gggcActive ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}
                                                              >
                                                                <span>{gggc.label}</span>
                                                              </Link>
                                                            );
                                                          })}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                }
                                                return (
                                                  <Link
                                                    key={ggc.path}
                                                    href={ggc.path}
                                                    className={`relative flex items-center rounded-lg py-2 pl-16 pr-3 text-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground`}
                                                    style={{}}
                                                  >
                                                    <span>{ggc.label}</span>
                                                  </Link>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                    return (
                                      <Link
                                        key={gc.path}
                                        href={gc.path}
                                        className={`relative flex items-center rounded-lg py-2 pl-12 pr-3 text-sm transition-all ${
                                          addIndustriesActive
                                            ? 'text-white shadow'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                        style={addIndustriesActive ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}
                                      >
                                        <span>{gc.label}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`relative flex items-center rounded-lg py-2 pl-8 pr-3 text-sm transition-all ${
                              childActive
                                ? "text-white shadow"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                            style={childActive ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}
                          >
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Profile Dropdown */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted ${
                    !sidebarOpen && "justify-center px-2"
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${adminEmail}`} alt={adminEmail} />
                    <AvatarFallback>{adminEmail.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">{adminEmail.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">
                {(() => {
                  const special = pathname === "/admin/add-booking" ? "New Booking" : null;
                  if (special) return special;
                  if (pathname?.startsWith("/admin/customers/") && pathname !== "/admin/customers") {
                    return "Customer Profile";
                  }
                  if (pathname?.startsWith("/admin/providers/") && pathname !== "/admin/providers") {
                    return "Provider Profile";
                  }
                  if (pathname?.startsWith("/admin/marketing")) {
                    return "Marketing";
                  }
                  return menuItems.find((item) => item.path === pathname)?.label || "Dashboard";
                })()}
              </h1>
              {pathname === "/admin/dashboard" && (
                <p className="text-sm text-muted-foreground">
                  Welcome back, {adminEmail.split('@')[0]}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative hover:bg-muted"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between gap-2">
                    <span>Notifications</span>
                    <div className="ml-auto flex items-center gap-3">
                      <button onClick={markAllAsRead} className="text-xs text-cyan-600 hover:underline">Mark all as read</button>
                      <span className="text-muted-foreground">·</span>
                      <button onClick={clearAllNotifications} className="text-xs text-red-600 hover:underline">Clear all</button>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">No notifications</div>
                  )}
                  {notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex items-start gap-2 py-3">
                      <div className={`mt-1 h-2 w-2 rounded-full ${n.read ? 'bg-muted-foreground/30' : 'bg-cyan-500'}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground">{n.description}</div>
                      </div>
                      <button
                        className="ml-2 text-xs text-muted-foreground hover:text-red-600"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotification(n.id); }}
                        aria-label="Delete notification"
                      >
                        Delete
                      </button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/")}
                className="hover:text-white transition-all"
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                View Website
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
