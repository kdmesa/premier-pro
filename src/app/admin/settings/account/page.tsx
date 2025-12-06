"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Building2, Shield, CreditCard, FileText, Gift } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="your-info" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="your-info" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Your Info</span>
          </TabsTrigger>
          <TabsTrigger value="earn-rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span>Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger value="subscription-plans" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Plans</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Invoices</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="your-info" className="pt-6">
          <Card>
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
        </TabsContent>

        <TabsContent value="earn-rewards" className="pt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
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
        </TabsContent>

        <TabsContent value="billing" className="pt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
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
        </TabsContent>

        <TabsContent value="subscription-plans" className="pt-6">
          <Card>
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
        </TabsContent>

        <TabsContent value="invoices" className="pt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Invoices</CardTitle>
              </div>
              <CardDescription>Download or view past invoices</CardDescription>
            </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No invoices yet. This is a placeholder.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
