"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Minus } from "lucide-react";

const BOOKINGS_STORAGE_KEY = "adminBookings";

const SERVICE_COSTS: Record<string, number> = {
  "Standard Cleaning": 120,
  "Deep Cleaning": 250,
  "Move In/Out Cleaning": 350,
  "Office Cleaning": 200,
  "Carpet Cleaning": 180,
};

const createEmptyBookingForm = () => ({
  customerType: "new",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  service: "",
  date: "",
  time: "",
  duration: "02",
  durationUnit: "Hours",
  frequency: "one-time",
  notifyMoreTime: false,
  address: "",
  paymentMethod: "",
  notes: "",
  adjustServiceTotal: false,
  adjustPrice: false,
  privateBookingNote: "",
  privateCustomerNote: "",
  serviceProviderNote: "",
  excludeCancellationFee: false,
  excludeMinimumFee: false,
  excludeCustomerNotification: false,
  excludeProviderNotification: false,
});

export default function AddBookingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [newBooking, setNewBooking] = useState(createEmptyBookingForm());
  const [showPrivateBookingNote, setShowPrivateBookingNote] = useState(false);
  const [showPrivateCustomerNote, setShowPrivateCustomerNote] = useState(false);
  const [showServiceProviderNote, setShowServiceProviderNote] = useState(false);

  const estimatedCost = useMemo(() => {
    const cost = SERVICE_COSTS[newBooking.service as keyof typeof SERVICE_COSTS];
    return typeof cost === "number" ? cost : 0;
  }, [newBooking.service]);

  const handleAddBooking = () => {
    // Validate form
    const customerName = `${newBooking.firstName} ${newBooking.lastName}`.trim();
    if (!newBooking.firstName || !newBooking.lastName || !newBooking.email || !newBooking.phone || 
        !newBooking.service || !newBooking.date || !newBooking.time || !newBooking.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newEntry = {
      id: `BK${Date.now()}`,
      customer: {
        name: customerName,
        email: newBooking.email,
        phone: newBooking.phone,
      },
      service: newBooking.service,
      date: newBooking.date,
      time: newBooking.time,
      address: newBooking.address,
      status: "pending",
      amount: "$0",
      paymentMethod: newBooking.paymentMethod || "Not specified",
      notes: newBooking.notes,
    };

    // Get existing bookings and add new one
    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    let bookings = [];
    if (stored) {
      try {
        bookings = JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse stored bookings", error);
      }
    }
    
    bookings.unshift(newEntry);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));

    toast({
      title: "Booking Added",
      description: `New booking created for ${customerName}`,
    });

    // Redirect back to bookings page
    router.push("/admin/bookings");
  };

  const handleCancel = () => {
    router.push("/admin/bookings");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Type Selection */}
            <div>
              <RadioGroup
                value={newBooking.customerType}
                onValueChange={(value) => setNewBooking({ ...newBooking, customerType: value })}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new-customer" />
                  <Label htmlFor="new-customer" className="font-medium">New customer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing-customer" />
                  <Label htmlFor="existing-customer" className="font-medium">Existing customer</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Name Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Ex: James"
                  value={newBooking.firstName}
                  onChange={(e) => setNewBooking({ ...newBooking, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Ex: Lee"
                  value={newBooking.lastName}
                  onChange={(e) => setNewBooking({ ...newBooking, lastName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: example@xyz.com"
                value={newBooking.email}
                onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
              />
            </div>

            {/* Time Duration */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Time Duration</Label>
              <div className="flex gap-3">
                <Select value={newBooking.duration} onValueChange={(value) => setNewBooking({ ...newBooking, duration: value })}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">01</SelectItem>
                    <SelectItem value="02">02</SelectItem>
                    <SelectItem value="03">03</SelectItem>
                    <SelectItem value="04">04</SelectItem>
                    <SelectItem value="05">05</SelectItem>
                    <SelectItem value="06">06</SelectItem>
                    <SelectItem value="07">07</SelectItem>
                    <SelectItem value="08">08</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newBooking.durationUnit} onValueChange={(value) => setNewBooking({ ...newBooking, durationUnit: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minutes">Minutes</SelectItem>
                    <SelectItem value="Hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Checkbox
                  id="notify-more-time"
                  checked={newBooking.notifyMoreTime}
                  onCheckedChange={(checked) => setNewBooking({ ...newBooking, notifyMoreTime: !!checked })}
                />
                <Label htmlFor="notify-more-time" className="text-sm">Notify me if the job requires more time.</Label>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Frequency</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={newBooking.frequency === "one-time" ? "default" : "outline"}
                  onClick={() => setNewBooking({ ...newBooking, frequency: "one-time" })}
                  className={newBooking.frequency === "one-time" ? "bg-cyan-500 hover:bg-cyan-600 text-white" : ""}
                >
                  One-time
                </Button>
                <Button
                  type="button"
                  variant={newBooking.frequency === "every-4-weeks" ? "default" : "outline"}
                  onClick={() => setNewBooking({ ...newBooking, frequency: "every-4-weeks" })}
                  className={newBooking.frequency === "every-4-weeks" ? "bg-cyan-500 hover:bg-cyan-600 text-white" : ""}
                >
                  Every 4 weeks
                </Button>
              </div>
            </div>

            {/* Booking Adjustments */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Booking Adjustments</h3>
              <div className="space-y-4">
                {/* Adjustment Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adjust-service-total"
                      checked={newBooking.adjustServiceTotal}
                      onCheckedChange={(checked) => setNewBooking({ ...newBooking, adjustServiceTotal: !!checked })}
                    />
                    <Label htmlFor="adjust-service-total" className="text-sm">Do you want to adjust service total?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adjust-price"
                      checked={newBooking.adjustPrice}
                      onCheckedChange={(checked) => setNewBooking({ ...newBooking, adjustPrice: !!checked })}
                    />
                    <Label htmlFor="adjust-price" className="text-sm">Do you want to adjust price?</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="service" className="text-sm font-medium mb-2 block">Service Type</Label>
                  <Select value={newBooking.service} onValueChange={(value) => setNewBooking({ ...newBooking, service: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard Cleaning">Standard Cleaning</SelectItem>
                      <SelectItem value="Deep Cleaning">Deep Cleaning</SelectItem>
                      <SelectItem value="Move In/Out Cleaning">Move In/Out Cleaning</SelectItem>
                      <SelectItem value="Office Cleaning">Office Cleaning</SelectItem>
                      <SelectItem value="Carpet Cleaning">Carpet Cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="date" className="text-sm font-medium mb-2 block">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-sm font-medium mb-2 block">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newBooking.time}
                      onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-medium mb-2 block">Service Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter service address"
                    value={newBooking.address}
                    onChange={(e) => setNewBooking({ ...newBooking, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment" className="text-sm font-medium mb-2 block">Payment Method</Label>
                  <Select value={newBooking.paymentMethod} onValueChange={(value) => setNewBooking({ ...newBooking, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium mb-2 block">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add any special instructions"
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  />
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Industry</span>
                <span className="font-medium">Post Construction</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{newBooking.service || "Post Construction Cleaning"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium">{newBooking.frequency === "one-time" ? "One-Time" : "Every 4 Weeks"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Length</span>
                <span className="font-medium">{newBooking.duration} {newBooking.durationUnit === "Hours" ? "Hr" : "Min"} {newBooking.duration !== "01" && newBooking.durationUnit === "Hours" ? "0 Min" : ""}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Total</span>
                <span className="font-medium">${estimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discounted Total</span>
                <span className="font-medium">${estimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>TOTAL</span>
                <span>${estimatedCost.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Note Cards */}
          <div className="space-y-3">
            <Card className="border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 px-4">
                <CardTitle className="text-base font-medium text-gray-900">Private Booking Note</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrivateBookingNote(!showPrivateBookingNote)}
                  className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900 ml-auto"
                >
                  {showPrivateBookingNote ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </CardHeader>
              {showPrivateBookingNote && (
                <CardContent className="pt-0 px-4 pb-4">
                  <Input
                    placeholder="Add private booking note..."
                    value={newBooking.privateBookingNote}
                    onChange={(e) => setNewBooking({ ...newBooking, privateBookingNote: e.target.value })}
                  />
                </CardContent>
              )}
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 px-4">
                <CardTitle className="text-base font-medium text-gray-900">Private Customer Note</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrivateCustomerNote(!showPrivateCustomerNote)}
                  className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900 ml-auto"
                >
                  {showPrivateCustomerNote ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </CardHeader>
              {showPrivateCustomerNote && (
                <CardContent className="pt-0 px-4 pb-4">
                  <Input
                    placeholder="Add private customer note..."
                    value={newBooking.privateCustomerNote}
                    onChange={(e) => setNewBooking({ ...newBooking, privateCustomerNote: e.target.value })}
                  />
                </CardContent>
              )}
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 px-4">
                <CardTitle className="text-base font-medium text-gray-900">Note For Service Provider</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServiceProviderNote(!showServiceProviderNote)}
                  className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900 ml-auto"
                >
                  {showServiceProviderNote ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </CardHeader>
              {showServiceProviderNote && (
                <CardContent className="pt-0 px-4 pb-4">
                  <Input
                    placeholder="Add note for service provider..."
                    value={newBooking.serviceProviderNote}
                    onChange={(e) => setNewBooking({ ...newBooking, serviceProviderNote: e.target.value })}
                  />
                </CardContent>
              )}
            </Card>
          </div>

          {/* Exclude Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-cancellation-fee"
                checked={newBooking.excludeCancellationFee}
                onCheckedChange={(checked) => setNewBooking({ ...newBooking, excludeCancellationFee: !!checked })}
              />
              <Label htmlFor="exclude-cancellation-fee" className="text-sm">Exclude cancellation fee</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-minimum-fee"
                checked={newBooking.excludeMinimumFee}
                onCheckedChange={(checked) => setNewBooking({ ...newBooking, excludeMinimumFee: !!checked })}
              />
              <Label htmlFor="exclude-minimum-fee" className="text-sm">Exclude minimum fee</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-customer-notification"
                checked={newBooking.excludeCustomerNotification}
                onCheckedChange={(checked) => setNewBooking({ ...newBooking, excludeCustomerNotification: !!checked })}
              />
              <Label htmlFor="exclude-customer-notification" className="text-sm">Exclude customer notification</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-provider-notification"
                checked={newBooking.excludeProviderNotification}
                onCheckedChange={(checked) => setNewBooking({ ...newBooking, excludeProviderNotification: !!checked })}
              />
              <Label htmlFor="exclude-provider-notification" className="text-sm">Exclude provider notification</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleAddBooking}
              className="text-white w-full"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              Save Booking
            </Button>
            <Button
              onClick={handleAddBooking}
              className="text-white w-full"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
            >
              Save As Draft
            </Button>
            <Button
              onClick={handleAddBooking}
              className="text-white w-full"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
            >
              Save As Quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
