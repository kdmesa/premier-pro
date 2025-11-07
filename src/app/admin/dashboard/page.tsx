"use client";

import { useState } from "react";
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

const recentBookings = [
  {
    id: "BK001",
    customer: "John Doe",
    service: "Deep Cleaning",
    date: "2024-11-08",
    time: "9:00 AM",
    status: "confirmed",
    amount: "$250"
  },
  {
    id: "BK002",
    customer: "Jane Smith",
    service: "Standard Cleaning",
    date: "2024-11-08",
    time: "11:00 AM",
    status: "pending",
    amount: "$120"
  },
  {
    id: "BK003",
    customer: "Mike Johnson",
    service: "Office Cleaning",
    date: "2024-11-09",
    time: "1:00 PM",
    status: "confirmed",
    amount: "$200"
  },
  {
    id: "BK004",
    customer: "Sarah Williams",
    service: "Carpet Cleaning",
    date: "2024-11-09",
    time: "3:00 PM",
    status: "completed",
    amount: "$150"
  },
  {
    id: "BK005",
    customer: "David Brown",
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
  
  // Mock upcoming bookings by date
  const bookingsByDate: { [key: string]: any[] } = {
    "2024-11-08": [
      { time: "9:00 AM", customer: "John Doe", service: "Deep Cleaning" },
      { time: "11:00 AM", customer: "Jane Smith", service: "Standard Cleaning" }
    ],
    "2024-11-09": [
      { time: "1:00 PM", customer: "Mike Johnson", service: "Office Cleaning" },
      { time: "3:00 PM", customer: "Sarah Williams", service: "Carpet Cleaning" }
    ],
    "2024-11-10": [
      { time: "9:00 AM", customer: "David Brown", service: "Move In/Out" }
    ],
    "2024-11-12": [
      { time: "10:00 AM", customer: "Emily Davis", service: "Deep Cleaning" }
    ],
    "2024-11-15": [
      { time: "2:00 PM", customer: "Robert Wilson", service: "Standard Cleaning" }
    ]
  };

  const hasBooking = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookingsByDate[dateStr] && bookingsByDate[dateStr].length > 0;
  };

  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookingsByDate[dateStr] || [];
  };

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

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
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
                  
                  return (
                    <div
                      key={day}
                      className={`min-h-[80px] p-1 rounded-lg text-sm relative transition-colors border ${
                        today 
                          ? 'bg-cyan-50 border-cyan-500 border-2 dark:bg-cyan-900/20' 
                          : hasBookings 
                          ? 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border-cyan-200 dark:border-cyan-800' 
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className={`text-xs font-semibold mb-1 ${today ? 'text-cyan-600 dark:text-cyan-400' : 'text-muted-foreground'}`}>
                        {day}
                      </div>
                      
                      {hasBookings && (
                        <div className="space-y-0.5">
                          {bookings.slice(0, 2).map((booking, i) => (
                            <div 
                              key={i} 
                              className="text-[10px] px-1 py-0.5 rounded truncate"
                              style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}
                              title={`${booking.time} - ${booking.customer} - ${booking.service}`}
                            >
                              {booking.customer.split(' ')[0]}
                            </div>
                          ))}
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
                  <div className="h-3 w-3 rounded border-2 border-cyan-500" />
                  <span className="text-muted-foreground">Today</span>
                </div>
              </div>
            </div>
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
            {recentBookings.map((booking) => (
              <div 
                key={booking.id} 
                className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{booking.customer}</p>
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Add New Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new booking for a customer
            </p>
            <Button className="w-full" style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}>
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Add New Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Register a new customer account
            </p>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Manage Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Update pricing and service details
            </p>
            <Button className="w-full" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Services
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
