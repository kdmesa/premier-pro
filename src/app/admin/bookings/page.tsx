"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, 
  Filter, 
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  List,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Send,
  UserPlus
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const BOOKINGS_STORAGE_KEY = "adminBookings";

// Mock data fallback - Generate dates dynamically
const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const getFutureDateString = (daysAhead: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const defaultBookings: any[] = [];

type Booking = typeof defaultBookings[number];

// Mock providers data
const mockProviders = [
  { id: "P001", name: "Sarah Johnson", rating: 4.9, completedJobs: 156, specialties: ["Deep Cleaning", "Standard Cleaning"] },
  { id: "P002", name: "Michael Chen", rating: 4.8, completedJobs: 142, specialties: ["Office Cleaning", "Carpet Cleaning"] },
  { id: "P003", name: "Emily Rodriguez", rating: 4.7, completedJobs: 128, specialties: ["Move In/Out", "Deep Cleaning"] },
  { id: "P004", name: "David Kim", rating: 4.9, completedJobs: 189, specialties: ["Standard Cleaning", "Office Cleaning"] },
  { id: "P005", name: "Jessica Martinez", rating: 4.6, completedJobs: 95, specialties: ["Carpet Cleaning", "Deep Cleaning"] },
];

type Provider = typeof mockProviders[number];


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

const getStatusTone = (status: string) => {
  switch (status) {
    case "completed":
      return {
        light: "bg-green-50",
        dark: "dark:bg-green-900/20",
        chip: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      };
    case "cancelled":
      return {
        light: "bg-red-50",
        dark: "dark:bg-red-900/20",
        chip: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      };
    default:
      return {
        light: "",
        dark: "",
        chip: "linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)",
      };
  }
};

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);
  const [hydrated, setHydrated] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const { toast } = useToast();


  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Booking[];
        if (Array.isArray(parsed)) {
          setBookings(parsed);
        }
      } catch (error) {
        console.error("Failed to parse stored bookings", error);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydrated) return;
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings, hydrated]);


  // Helper function to check if a date is today
  const isToday = (dateString: string) => {
    const today = new Date();
    const bookingDate = new Date(dateString);
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  };

  // Helper function to check if a date is in the future
  const isFuture = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(dateString);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate > today;
  };

  // Helper function to check if a date is in the current month and future
  const isUpcomingThisMonth = (dateString: string) => {
    const today = new Date();
    const bookingDate = new Date(dateString);
    return (
      bookingDate > today &&
      bookingDate.getMonth() === currentDate.getMonth() &&
      bookingDate.getFullYear() === currentDate.getFullYear()
    );
  };

  // Helper function to check if a date is in the past
  const isPast = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(dateString);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    // Tab-based filtering
    let matchesTab = true;
    switch (activeTab) {
      case "today":
        // Only bookings for today's date
        matchesTab = isToday(booking.date);
        break;
      case "upcoming":
        // Only future bookings in the current month (for calendar view)
        matchesTab = isUpcomingThisMonth(booking.date) && booking.status !== "cancelled" && booking.status !== "completed";
        break;
      case "unassigned":
        // All bookings without assigned provider
        matchesTab = !(booking as any).assignedProvider;
        break;
      case "draft":
        // All pending/draft bookings
        matchesTab = booking.status === "pending";
        break;
      case "cancelled":
        // Only cancelled bookings
        matchesTab = booking.status === "cancelled";
        break;
      case "history":
        // Completed and cancelled bookings
        matchesTab = booking.status === "completed" || booking.status === "cancelled";
        break;
      default:
        matchesTab = true;
    }
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings((prev) => {
      const updated = prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      const activeSelection = updated.find((booking) => booking.id === bookingId) || null;
      setSelectedBooking(activeSelection);

      toast({
        title: "Status Updated",
        description: `Booking ${bookingId} status changed to ${newStatus}`,
      });

      return updated;
    });
    setShowDetails(false);
  };

  const handleAssignProvider = () => {
    if (!selectedProvider || !selectedBooking) return;
    
    setBookings((prev) => {
      const updated = prev.map((booking) =>
        booking.id === selectedBooking.id 
          ? { ...booking, assignedProvider: selectedProvider.name } 
          : booking
      );
      const activeSelection = updated.find((booking) => booking.id === selectedBooking.id) || null;
      setSelectedBooking(activeSelection);
      return updated;
    });
    
    toast({
      title: "Provider Assigned",
      description: `${selectedProvider.name} has been assigned to booking ${selectedBooking.id}`,
    });
    
    setShowProviderDialog(false);
    setSelectedProvider(null);
  };


  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date: string) => {
    return bookings.filter((booking) => booking.date === date);
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate counts for each tab
  const todayCount = bookings.filter(b => isToday(b.date)).length;
  const upcomingCount = bookings.filter(b => isUpcomingThisMonth(b.date) && b.status !== "cancelled" && b.status !== "completed").length;
  const unassignedCount = bookings.filter(b => !(b as any).assignedProvider).length;
  const draftCount = bookings.filter(b => b.status === "pending").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;
  const historyCount = bookings.filter(b => b.status === "completed" || b.status === "cancelled").length;

  // Determine if view mode controls should be shown and force list view for draft tab
  const showViewModeControls = activeTab !== "draft" && activeTab !== "today";
  const effectiveViewMode = activeTab === "draft" ? "list" : activeTab === "today" ? "schedule" : viewMode;

  // Get unique providers from bookings
  const uniqueProviders = useMemo(() => {
    const providers = new Set<string>();
    bookings.forEach(booking => {
      if ((booking as any).assignedProvider) {
        providers.add((booking as any).assignedProvider);
      }
    });
    return Array.from(providers);
  }, [bookings]);

  // Generate time slots from 6am to 10pm
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      const period = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.push({
        hour,
        label: `${displayHour}${period}`,
        time24: `${String(hour).padStart(2, '0')}:00`
      });
    }
    return slots;
  }, []);

  // Helper to convert time string to hour number
  const getHourFromTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return 0;
    
    const [time, period] = parts;
    const hourParts = time.split(':');
    if (hourParts.length === 0) return 0;
    
    let hour = parseInt(hourParts[0], 10);
    if (isNaN(hour)) return 0;
    
    const upperPeriod = period.toUpperCase();
    if (upperPeriod === 'PM' && hour !== 12) hour += 12;
    if (upperPeriod === 'AM' && hour === 12) hour = 0;
    return hour;
  };

  // Get bookings for a specific provider and time slot
  const getBookingsForSlot = (provider: string, hour: number) => {
    return filteredBookings.filter(booking => {
      if ((booking as any).assignedProvider !== provider) return false;
      const bookingHour = getHourFromTime(booking.time);
      return bookingHour === hour;
    });
  };

  // Get unassigned bookings for a time slot
  const getUnassignedBookingsForSlot = (hour: number) => {
    return filteredBookings.filter(booking => {
      if ((booking as any).assignedProvider) return false;
      const bookingHour = getHourFromTime(booking.time);
      return bookingHour === hour;
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="today" className="text-xs sm:text-sm py-2 flex flex-col sm:flex-row items-center gap-1">
            <span>Today&apos;s Bookings</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-cyan-500 text-white">
              {todayCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm py-2 flex flex-col sm:flex-row items-center gap-1">
            <span>Upcoming</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-cyan-500 text-white">
              {upcomingCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="text-xs sm:text-sm py-2 flex flex-col sm:flex-row items-center gap-1">
            <span>Unassigned</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-orange-500 text-white">
              {unassignedCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="draft" className="text-xs sm:text-sm py-2 flex flex-col sm:flex-row items-center gap-1">
            <span>Draft/Quote</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-yellow-500 text-white">
              {draftCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs sm:text-sm py-2 flex flex-col sm:flex-row items-center gap-1">
            <span>Cancelled</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-500 text-white">
              {cancelledCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm py-2 flex flex-col sm:flex-row items-center gap-1">
            <span>History</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-green-500 text-white">
              {historyCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {/* View Toggle Buttons - Hidden for draft tab */}
          {showViewModeControls && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("calendar")}
                className={viewMode === "calendar" ? "text-white" : ""}
                style={viewMode === "calendar" ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}
                title="Calendar View"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "text-white" : ""}
                style={viewMode === "list" ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}
                title="List View"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            className="text-white"
            style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' }}
            title="Send Schedule"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Schedule
          </Button>
          <Button 
            onClick={() => router.push("/admin/add-booking")}
            className="text-white"
            style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Button>
        </div>
      </div>


      {/* Day Schedule View - Only for Today's Bookings */}
      {effectiveViewMode === "schedule" && activeTab === "today" && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header Row */}
                <div className="grid grid-cols-[80px_1fr_1fr] gap-0 border-b bg-muted/30">
                  <div className="p-3 border-r font-medium text-sm">Time</div>
                  <div className="p-3 border-r font-medium text-sm">Unassigned</div>
                  <div className="p-3 font-medium text-sm">Assigned</div>
                </div>

                {/* Time Slots */}
                <div className="space-y-0">
                  {timeSlots.map((slot) => {
                    const unassignedBookings = getUnassignedBookingsForSlot(slot.hour);
                    const allAssignedBookings = filteredBookings.filter(booking => {
                      if (!(booking as any).assignedProvider) return false;
                      const bookingHour = getHourFromTime(booking.time);
                      return bookingHour === slot.hour;
                    });

                    return (
                      <div key={slot.hour} className="grid grid-cols-[80px_1fr_1fr] gap-0 border-b hover:bg-muted/20 transition-colors">
                        {/* Time Column */}
                        <div className="p-3 border-r text-sm font-medium text-muted-foreground">
                          {slot.label}
                        </div>
                        
                        {/* Unassigned Column */}
                        <div className="p-2 border-r flex flex-wrap gap-2 min-h-[60px] items-start">
                          {unassignedBookings.map(booking => (
                            <div
                              key={booking.id}
                              onClick={() => handleViewDetails(booking)}
                              className="px-3 py-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity inline-block"
                              style={{ background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', color: 'white' }}
                            >
                              <div className="font-semibold">{booking.service}</div>
                            </div>
                          ))}
                        </div>

                        {/* Assigned Column */}
                        <div className="p-2 flex flex-wrap gap-2 min-h-[60px] items-start">
                          {allAssignedBookings.map(booking => (
                            <div
                              key={booking.id}
                              onClick={() => handleViewDetails(booking)}
                              className="px-3 py-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity inline-block"
                              style={{ 
                                background: booking.status === 'confirmed' 
                                  ? 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)'
                                  : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: 'white'
                              }}
                            >
                              <div className="font-semibold">{booking.service}</div>
                              <div className="text-[10px] opacity-90 mt-0.5">{(booking as any).assignedProvider}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {effectiveViewMode === "list" && (
        <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Date & Time
                  </th>
                  {activeTab === "draft" && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Type
                    </th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const tone = getStatusTone(booking.status);
                  return (
                    <tr
                      key={booking.id}
                      className={cn(
                        "border-b border-border transition-colors",
                        tone.light,
                        tone.dark,
                        booking.status === "completed" || booking.status === "cancelled"
                          ? "hover:opacity-90"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium">{booking.customer.name}</div>
                        <div className="text-xs text-muted-foreground">{booking.customer.email}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">{booking.service}</td>
                      <td className="py-3 px-4 text-sm">
                        <div>{booking.date}</div>
                        <div className="text-xs text-muted-foreground">{booking.time}</div>
                      </td>
                      {activeTab === "draft" && (
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            (booking as any).bookingType === "draft" 
                              ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              : (booking as any).bookingType === "quote"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          }`}>
                            {(booking as any).bookingType === "draft" ? "Draft" : (booking as any).bookingType === "quote" ? "Quote" : "Booking"}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                      <td className="py-3 px-4 text-sm font-medium text-right">{booking.amount}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Calendar View */}
      {effectiveViewMode === "calendar" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{monthNames[month]} {year}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-xs text-muted-foreground py-1">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="h-20" />
              ))}
              
              {/* Calendar days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dateString = formatDate(year, month, day);
                const dayBookings = getBookingsForDate(dateString);
                const hasBookings = dayBookings.length > 0;
                const today = new Date();
                const isToday = today.getDate() === day && 
                               today.getMonth() === month && 
                               today.getFullYear() === year;
                
                return (
                  <div
                    key={day}
                    className={`h-20 border rounded-md p-1 hover:bg-muted/50 transition-colors cursor-pointer ${
                      isToday ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-xs font-medium mb-0.5 ${
                        isToday ? 'text-cyan-600 dark:text-cyan-400' : ''
                      }`}>
                        {day}
                      </div>
                      {hasBookings && (
                        <div className="flex-1 space-y-0.5 overflow-y-auto">
                          {dayBookings.slice(0, 2).map((booking) => {
                            const tone = getStatusTone(booking.status);
                            return (
                              <div
                                key={booking.id}
                                onClick={() => handleViewDetails(booking)}
                                className="text-[10px] px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity text-white"
                                style={{ background: tone.chip }}
                              >
                                <div className="truncate font-medium">{booking.time}</div>
                                <div className="truncate">{booking.service}</div>
                              </div>
                            );
                          })}
                          {dayBookings.length > 2 && (
                            <div className="text-[10px] text-muted-foreground text-center">
                              +{dayBookings.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-200" />
                <span>Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200" />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-200" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-200" />
                <span>Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Booking Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
            <DialogDescription>
              View and manage booking information
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Customer Information</h3>
                <div className="grid gap-2 bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{selectedBooking.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{selectedBooking.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{selectedBooking.address}</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Service Details</h3>
                <div className="grid gap-2 bg-muted/50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service:</span>
                    <span className="text-sm font-medium">{selectedBooking.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm font-medium">{selectedBooking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <span className="text-sm font-medium">{selectedBooking.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method:</span>
                    <span className="text-sm font-medium">{selectedBooking.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="text-sm font-bold">{selectedBooking.amount}</span>
                  </div>
                  {(selectedBooking as any).assignedProvider && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Assigned Provider:</span>
                      <span className="text-sm font-medium text-cyan-600">{(selectedBooking as any).assignedProvider}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {/* Assign Provider Button - Only visible for confirmed bookings */}
                {selectedBooking.status === "confirmed" && (
                  <Button 
                    className="w-full"
                    style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}
                    onClick={() => setShowProviderDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Provider
                  </Button>
                )}

                {/* Status Action Buttons */}
                <div className="flex gap-2">
                  {selectedBooking.status === "pending" && (
                    <Button 
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}
                      onClick={() => handleStatusChange(selectedBooking.id, "confirmed")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                  )}
                  {selectedBooking.status === "confirmed" && (
                    <Button 
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}
                      onClick={() => handleStatusChange(selectedBooking.id, "completed")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                  {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleStatusChange(selectedBooking.id, "cancelled")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provider Assignment Dialog */}
      <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Assign Provider</DialogTitle>
            <DialogDescription>
              Select an available provider for {selectedBooking?.service} on {selectedBooking?.date} at {selectedBooking?.time}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {mockProviders.map((provider) => (
              <div
                key={provider.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider?.id === provider.id
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20'
                    : 'border-border hover:border-cyan-300'
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-base">{provider.name}</h3>
                  {selectedProvider?.id === provider.id && (
                    <CheckCircle2 className="h-5 w-5 text-cyan-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProviderDialog(false);
                setSelectedProvider(null);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedProvider}
              style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}
              onClick={handleAssignProvider}
            >
              Assign Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
