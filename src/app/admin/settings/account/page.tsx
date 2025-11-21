"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Building2, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AccountSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* In-page submenu */}
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Account sections</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Go to section</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/settings/account?section=your-info")}>Your info</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/settings/account?section=earn-rewards")}>Earn Rewards</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/settings/account?section=billing")}>Billing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/settings/account?section=subscription-plans")}>Subscription plans</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/settings/account?section=invoices")}>Invoices</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Your info */}
      <Card id="your-info">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Your info</CardTitle>
          </div>
          <CardDescription>Update your personal or company details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name or company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="City, State, Country" />
            </div>
          </div>
          <Button className="mt-4" style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Earn Rewards */}
      <Card id="earn-rewards">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Earn Rewards</CardTitle>
          </div>
          <CardDescription>Configure referral codes and loyalty rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Placeholder content for rewards configuration.
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card id="billing">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Billing</CardTitle>
          </div>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input id="card-name" placeholder="Name on card" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="•••• •••• •••• ••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp">Expiry</Label>
              <Input id="exp" placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="CVC" />
            </div>
          </div>
          <Button className="mt-4" style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}>
            <Save className="h-4 w-4 mr-2" />
            Save Billing
          </Button>
        </CardContent>
      </Card>

      {/* Subscription plans */}
      <Card id="subscription-plans">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Subscription plans</CardTitle>
          </div>
          <CardDescription>View or change your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Current plan: Starter (placeholder)</p>
            <div className="flex gap-2">
              <Button variant="outline">Manage Plan</Button>
              <Button style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}>Upgrade</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card id="invoices">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Invoices</CardTitle>
          </div>
          <CardDescription>Download or view past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No invoices yet. This is a placeholder.</div>
        </CardContent>
      </Card>
    </div>
  );
}
