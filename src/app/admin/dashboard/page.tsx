"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BOOKINGS_STORAGE_KEY = "adminBookings";

type Booking = {
  id: string;
  customer: { name: string; email: string; phone: string } | string;
  service: string;
  date: string;
  time: string;
  status: string;
  amount: string;
  paymentMethod?: string;
  notes?: string;
};

// Mock data - replace with real API calls
const stats = [
  {
    title: "Total Revenue",
    value: "$12,450",
    change: "+12.5%",
    icon: DollarSign,
    trend: "up",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20"
  },
  {
    title: "Total Bookings",
    value: "156",
    change: "+8.2%",
    icon: Calendar,
    trend: "up",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20"
  },
  {
    title: "Active Customers",
    value: "89",
    change: "+5.1%",
    icon: Users,
    trend: "up",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20"
  },
  {
    title: "Completion Rate",
    value: "94.2%",
    change: "+2.3%",
    icon: TrendingUp,
    trend: "up",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20"
  },
];

const defaultBookings: Booking[] = [
  {
    id: "BK001",
    customer: { name: "John Doe", email: "john@example.com", phone: "(555) 123-4567" },
    service: "Deep Cleaning",
    date: "2024-11-08",
    time: "9:00 AM",
    status: "confirmed",
    amount: "$250"
  },
  {
    id: "BK002",
    customer: { name: "Jane Smith", email: "jane@example.com", phone: "(555) 234-5678" },
    service: "Standard Cleaning",
    date: "2024-11-08",
    time: "11:00 AM",
    status: "pending",
    amount: "$120"
  },
  {
    id: "BK003",
    customer: { name: "Mike Johnson", email: "mike@example.com", phone: "(555) 345-6789" },
    service: "Office Cleaning",
    date: "2024-11-09",
    time: "1:00 PM",
    status: "confirmed",
    amount: "$200"
  },
  {
    id: "BK004",
    customer: { name: "Sarah Williams", email: "sarah@example.com", phone: "(555) 456-7890" },
    service: "Carpet Cleaning",
    date: "2024-11-09",
    time: "3:00 PM",
    status: "completed",
    amount: "$150"
  },
  {
    id: "BK005",
    customer: { name: "David Brown", email: "david@example.com", phone: "(555) 567-8901" },
    service: "Move In/Out",
    date: "2024-11-10",
    time: "9:00 AM",
    status: "cancelled",
    amount: "$350"
  },
];

const getStatusBadge = (status: string) => {
  const styles = {
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  };

  const icons = {
    confirmed: CheckCircle2,
    pending: Clock,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const Icon = icons[status as keyof typeof icons] || AlertCircle;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Booking[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBookings(parsed);
        }
      } catch (error) {
        console.error("Failed to load bookings for dashboard", error);
      }
    }
  }, []);
  
  // Get calendar data
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const normalizedBookings = useMemo(() => {
    return bookings.map((booking) => ({
      ...booking,
      customerName: typeof booking.customer === "string" ? booking.customer : booking.customer.name,
    }));
  }, [bookings]);

  const bookingsByDate = useMemo(() => {
    return normalizedBookings.reduce<Record<string, typeof normalizedBookings>>(function (acc, booking) {
      const dateKey = booking.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(booking);
      return acc;
    }, {});
  }, [normalizedBookings]);

  useEffect(() => {
    const today = new Date();
    const upcoming = [...normalizedBookings]
      .filter((booking) => new Date(booking.date) >= new Date(today.toDateString()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (upcoming.length > 0) {
      setSelectedDate(upcoming[0].date);
    }
  }, [normalizedBookings]);

  const hasBooking = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookingsByDate[dateStr] && bookingsByDate[dateStr].length > 0;
  };

  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookingsByDate[dateStr] || [];
  };

  const getFormattedSelectedDate = useMemo(() => {
    if (!selectedDate) return null;
    const date = new Date(selectedDate);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }, [selectedDate]);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const acceptBooking = () => {
    if (!selectedBooking) return;
    const id = selectedBooking.id;
    setBookings((prev) => {
      const next = prev.map((b) => b.id === id ? { ...b, status: 'confirmed' } : b);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next)); } catch {}
      }
      return next;
    });
    setSelectedBooking((b) => b ? { ...b, status: 'confirmed' } : b);
    const name = typeof selectedBooking.customer === 'string' ? selectedBooking.customer : selectedBooking.customer.name;
    toast({ title: 'Booking accepted', description: `${name} • ${selectedBooking.service} is now confirmed.` });
  };

  return (
    <>
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </Card>
          );
        })}
      </div>

      {/* Calendar and Recent Bookings Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Bookings Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {monthNames[month]} {year}
            </p>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="min-h-[80px]" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const hasBookings = hasBooking(day);
                  const bookings = getBookingsForDay(day);
                  const today = isToday(day);
                  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  
                  const statusForDay = bookings.find((booking) => booking.status === "completed")
                    ? "completed"
                    : bookings.find((booking) => booking.status === "cancelled")
                    ? "cancelled"
                    : null;

                  const dayBaseClass = cn(
                    "min-h-[80px] p-1 rounded-lg text-sm relative transition-colors border",
                    today
                      ? "bg-cyan-50 border-cyan-500 border-2 dark:bg-cyan-900/20"
                      : hasBookings
                        ? statusForDay === "completed"
                          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                          : statusForDay === "cancelled"
                            ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                            : "bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border-cyan-200 dark:border-cyan-800"
                        : "border-border hover:bg-muted"
                  );

                  return (
                    <div
                      key={day}
                      className={dayBaseClass}
                      onClick={() => {
                        if (hasBookings) {
                          setSelectedDate(dateKey);
                        }
                      }}
                    >
                      <div className={`text-xs font-semibold mb-1 ${today ? 'text-cyan-600 dark:text-cyan-400' : 'text-muted-foreground'}`}>
                        {day}
                      </div>
                      
                      {hasBookings && (
                        <div className="space-y-0.5">
                          {bookings.slice(0, 2).map((booking, i) => {
                            const chipColor = booking.status === "completed"
                              ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                              : booking.status === "cancelled"
                                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                : 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)';

                            return (
                              <div 
                                key={i} 
                                className="text-[9px] px-1 py-1 rounded text-white leading-tight cursor-pointer"
                                style={{ background: chipColor }}
                                title={`${booking.time} - ${booking.customerName} - ${booking.service}`}
                                onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                              >
                                <div className="font-semibold truncate">{booking.time}</div>
                                <div className="truncate">{booking.customerName.split(' ')[0]}</div>
                              </div>
                            );
                          })}
                          {bookings.length > 2 && (
                            <div className="text-[9px] text-muted-foreground px-1">
                              +{bookings.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20" />
                  <span className="text-muted-foreground">Has bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-200" />
                  <span className="text-muted-foreground">Completed bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-red-200" />
                  <span className="text-muted-foreground">Cancelled bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border-2 border-cyan-500" />
                  <span className="text-muted-foreground">Today</span>
                </div>
              </div>
            </div>

            {/* Selected date bookings */}
            {selectedDate && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Bookings on {getFormattedSelectedDate}</h4>
                <div className="space-y-2">
                  {(bookingsByDate[selectedDate] || []).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div>
                        <p className="font-medium text-foreground">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">{booking.service} • {booking.time}</p>
                      </div>
                      <span className="text-xs text-muted-foreground uppercase">{booking.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Bookings</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Latest booking requests and appointments
            </p>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {normalizedBookings.slice(0, 5).map((booking) => (
              <div 
                key={booking.id} 
                className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
                role="button"
                title={`View ${booking.customerName} • ${booking.service}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{booking.customerName}</p>
                    <p className="text-xs text-muted-foreground">{booking.service}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{booking.date} • {booking.time}</span>
                  </div>
                  <span className="font-semibold text-foreground">{booking.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>

      
    </div>
    {/* Booking Details Dialog */}
    <Dialog open={!!selectedBooking} onOpenChange={(o) => { if (!o) setSelectedBooking(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>View information about this booking.</DialogDescription>
        </DialogHeader>
        {selectedBooking && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-muted-foreground">Booking ID</div>
                <div className="font-medium">{selectedBooking.id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium uppercase">{selectedBooking.status}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Customer</div>
                <div className="font-medium">{typeof selectedBooking.customer === 'string' ? selectedBooking.customer : selectedBooking.customer.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Service</div>
                <div className="font-medium">{selectedBooking.service}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Date</div>
                <div className="font-medium">{selectedBooking.date} • {selectedBooking.time}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-medium">{selectedBooking.amount}</div>
              </div>
            </div>
            {typeof selectedBooking.customer !== 'string' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium">{selectedBooking.customer.email}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Phone</div>
                  <div className="font-medium">{selectedBooking.customer.phone}</div>
                </div>
              </div>
            )}
            {selectedBooking.notes && (
              <div>
                <div className="text-muted-foreground">Notes</div>
                <div className="font-medium">{selectedBooking.notes}</div>
              </div>
            )}
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
          {selectedBooking?.status === 'pending' && (
            <Button onClick={acceptBooking} variant="default">Accept Booking</Button>
          )}
          <Button onClick={() => { router.push('/admin/bookings'); }}>View Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Dashboard;
