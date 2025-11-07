import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/orbit.png";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    // { icon: Briefcase, label: "Services", path: "/admin/services" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  // Get admin email from localStorage
  const adminEmail = localStorage.getItem("adminEmail") || "Admin";

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
          <div className="flex items-center justify-between p-4 border-b border-border">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <Image src={logo} alt="Logo" width={40} height={40} className="rounded" />
                  <div>
                    <h2 className="font-bold text-sm text-foreground">Orbit Booking</h2>
                    <p className="text-xs text-muted-foreground">Admin Panel</p>
                  </div>
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
              const isActive = pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
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
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </Button>
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
                {menuItems.find((item) => item.path === pathname)?.label || "Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {adminEmail.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center gap-4">
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
