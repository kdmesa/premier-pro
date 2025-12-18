'use client'

import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import { Providers } from "@/app/providers";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Don't protect the login page
  if (isLoginPage) {
    return <Providers>{children}</Providers>;
  }

  return (
    <Providers>
      <ProtectedRoute>
        <AdminLayout>
          {children}
        </AdminLayout>
      </ProtectedRoute>
    </Providers>
  );
}
