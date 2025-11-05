import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data
const bookingsData = [
  {
    id: "BK001",
    customer: { name: "John Doe", email: "john@example.com", phone: "(555) 123-4567" },
    service: "Deep Cleaning",
    date: "2024-11-08",
    time: "9:00 AM",
    address: "123 Main St, Chicago, IL",
    status: "confirmed",
    amount: "$250",
    paymentMethod: "Credit Card",
    notes: "Please bring extra cleaning supplies"
  },
  {
    id: "BK002",
    customer: { name: "Jane Smith", email: "jane@example.com", phone: "(555) 234-5678" },
    service: "Standard Cleaning",
    date: "2024-11-08",
    time: "11:00 AM",
    address: "456 Oak Ave, Chicago, IL",
    status: "pending",
    amount: "$120",
    paymentMethod: "Cash",
    notes: ""
  },
  {
    id: "BK003",
    customer: { name: "Mike Johnson", email: "mike@example.com", phone: "(555) 345-6789" },
    service: "Office Cleaning",
    date: "2024-11-09",
    time: "1:00 PM",
    address: "789 Business Blvd, Chicago, IL",
    status: "confirmed",
    amount: "$200",
    paymentMethod: "Credit Card",
    notes: "Office closes at 5 PM"
  },
  {
    id: "BK004",
    customer: { name: "Sarah Williams", email: "sarah@example.com", phone: "(555) 456-7890" },
    service: "Carpet Cleaning",
    date: "2024-11-09",
    time: "3:00 PM",
    address: "321 Pine St, Chicago, IL",
    status: "completed",
    amount: "$150",
    paymentMethod: "Credit Card",
    notes: ""
  },
  {
    id: "BK005",
    customer: { name: "David Brown", email: "david@example.com", phone: "(555) 567-8901" },
    service: "Move In/Out",
    date: "2024-11-10",
    time: "9:00 AM",
    address: "654 Elm Dr, Chicago, IL",
    status: "cancelled",
    amount: "$350",
    paymentMethod: "Cash",
    notes: "Customer cancelled due to schedule conflict"
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

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<typeof bookingsData[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const filteredBookings = bookingsData.filter((booking) => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (booking: typeof bookingsData[0]) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Booking ${bookingId} status changed to ${newStatus}`,
    });
    setShowDetails(false);
  };

  return (
    <div className="space-y-6">
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
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Bookings Table */}
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
                    Booking ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Date & Time
                  </th>
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
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{booking.id}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{booking.customer.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.customer.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{booking.service}</td>
                    <td className="py-3 px-4 text-sm">
                      <div>{booking.date}</div>
                      <div className="text-xs text-muted-foreground">{booking.time}</div>
                    </td>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
            <DialogDescription>
              View and manage booking information
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Customer Information</h3>
                <div className="grid gap-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedBooking.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedBooking.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedBooking.address}</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Service Details</h3>
                <div className="grid gap-3 bg-muted/50 p-4 rounded-lg">
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
              <div className="flex gap-2">
                {selectedBooking.status === "pending" && (
                  <Button 
                    className="flex-1"
                    style={{ background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', color: 'white' }}
                    onClick={() => handleStatusChange(selectedBooking.id, "confirmed")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </Button>
                )}
                {selectedBooking.status === "confirmed" && (
                  <Button 
                    className="flex-1"
                    style={{ background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', color: 'white' }}
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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;
