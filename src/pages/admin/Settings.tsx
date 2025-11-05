import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Palette
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState({
    name: "Premier Pro Cleaners",
    email: "info@premierprocleaners.com",
    phone: "+1 234 567 890",
    address: "Chicago, Illinois, USA",
    description: "Professional cleaning services for homes and businesses"
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailCancellations: true,
    emailPayments: true,
    smsReminders: false,
    pushNotifications: true
  });

  const handleSaveCompanyInfo = () => {
    toast({
      title: "Settings Saved",
      description: "Company information has been updated successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Preferences Saved",
      description: "Notification preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Company Information</CardTitle>
          </div>
          <CardDescription>
            Update your company details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company-email"
                  type="email"
                  className="pl-10"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company-phone"
                  className="pl-10"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company-address"
                  className="pl-10"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-description">Description</Label>
            <Textarea
              id="company-description"
              rows={3}
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
            />
          </div>

          <Button onClick={handleSaveCompanyInfo} style={{ background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', color: 'white' }}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive notifications about bookings and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-bookings">Email - New Bookings</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for new booking requests
                </p>
              </div>
              <Switch
                id="email-bookings"
                checked={notifications.emailBookings}
                onCheckedChange={(checked) => setNotifications({...notifications, emailBookings: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-cancellations">Email - Cancellations</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a booking is cancelled
                </p>
              </div>
              <Switch
                id="email-cancellations"
                checked={notifications.emailCancellations}
                onCheckedChange={(checked) => setNotifications({...notifications, emailCancellations: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-payments">Email - Payment Confirmations</Label>
                <p className="text-sm text-muted-foreground">
                  Receive confirmation when payments are received
                </p>
              </div>
              <Switch
                id="email-payments"
                checked={notifications.emailPayments}
                onCheckedChange={(checked) => setNotifications({...notifications, emailPayments: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-reminders">SMS - Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send SMS reminders before appointments
                </p>
              </div>
              <Switch
                id="sms-reminders"
                checked={notifications.smsReminders}
                onCheckedChange={(checked) => setNotifications({...notifications, smsReminders: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable browser push notifications
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications} style={{ background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', color: 'white' }}>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security and password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <Button style={{ background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', color: 'white' }}>
            <Shield className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize the look and feel of your admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Light</Button>
              <Button variant="outline" size="sm">Dark</Button>
              <Button variant="outline" size="sm">System</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
