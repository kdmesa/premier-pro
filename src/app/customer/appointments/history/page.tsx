"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, History, Search, Star } from "lucide-react";

import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { BookingsTable } from "@/components/customer/BookingsTable";
import { useCustomerBookings } from "@/hooks/useCustomerBookings";
import { useCustomerAccount } from "@/hooks/useCustomerAccount";
import { Input } from "@/components/ui/input";
import { Booking } from "@/lib/customer-bookings";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

type BookingReview = {
  rating: number;
  feedback: string;
  updatedAt: string;
};

const REVIEWS_STORAGE_KEY = "customerBookingReviews";

const formatBookingDateTime = (booking: Booking) => {
  const composed = new Date(`${booking.date}T${booking.time}`);
  if (Number.isNaN(composed.getTime())) {
    return `${booking.date} • ${booking.time}`;
  }
  const datePart = composed.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = composed.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${datePart} • ${timePart}`;
};

const CustomerPreviousAppointmentsPage = () => {
  const router = useRouter();
  const { bookings, loading: bookingsLoading } = useCustomerBookings();
  const { customerName, customerEmail, accountLoading, handleLogout } = useCustomerAccount();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [reviews, setReviews] = useState<Record<string, BookingReview>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, BookingReview>;
        if (parsed && typeof parsed === "object") {
          setReviews(parsed);
        }
      }
    } catch (error) {
      console.warn("Failed to load stored reviews", error);
    }
  }, []);

  const persistReviews = useCallback((next: Record<string, BookingReview>) => {
    setReviews(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const closeReviewDialog = useCallback(() => {
    setReviewDialogOpen(false);
    setActiveBooking(null);
    setRating(5);
    setFeedback("");
  }, []);

  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    if (!search.trim()) return completedBookings;
    const term = search.toLowerCase();
    return completedBookings.filter(
      (booking) =>
        booking.service.toLowerCase().includes(term) ||
        booking.provider.toLowerCase().includes(term) ||
        booking.address.toLowerCase().includes(term) ||
        booking.id.toLowerCase().includes(term),
    );
  }, [completedBookings, search]);

  const firstName = customerName.split(" ")[0] || "Customer";
  const initials = useMemo(() => (
    customerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "PP"
  ), [customerName]);

  const handleEditReview = useCallback(
    (booking: Booking) => {
      setActiveBooking(booking);
      const existing = reviews[booking.id];
      setRating(existing?.rating ?? 5);
      setFeedback(existing?.feedback ?? "");
      setReviewDialogOpen(true);
    },
    [reviews],
  );

  const handleViewDetails = useCallback((booking: Booking) => {
    router.push(`/customer/appointments/${booking.id}`);
  }, [router]);

  const handleAddTip = useCallback((booking: Booking) => {
    if (typeof window !== "undefined") {
      window.alert(`Opening tip flow for ${booking.service}.`);
    }
  }, []);

  const handleBookAgain = useCallback((booking: Booking) => {
    router.push(`/book-now?bookingId=${booking.id}`);
  }, [router]);

  const handleSubmitReview = useCallback(() => {
    if (!activeBooking) return;
    const trimmedFeedback = feedback.trim();
    const nextReviews = {
      ...reviews,
      [activeBooking.id]: { rating, feedback: trimmedFeedback, updatedAt: new Date().toISOString() },
    } satisfies Record<string, BookingReview>;
    persistReviews(nextReviews);
    toast({
      title: "Review updated",
      description: `Thanks for rating ${activeBooking.service}.`,
    });
    closeReviewDialog();
  }, [activeBooking, feedback, rating, reviews, persistReviews, toast, closeReviewDialog]);

  const ratingButtons = [1, 2, 3, 4, 5];

  if (bookingsLoading || accountLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Clock className="h-8 w-8 animate-spin" />
          <p>Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[280px_1fr]">
        <CustomerSidebar
          customerName={customerName}
          customerEmail={customerEmail}
          initials={initials}
          onLogout={handleLogout}
        />
        <div className="order-1 flex flex-col lg:order-2">
          <header className="bg-background border-b border-border shadow-sm">
            <div className="flex flex-col px-6 py-5 gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="h-4 w-4" />
                Service history
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Previous appointments</h1>
              <p className="text-sm text-muted-foreground">
                Review recently completed cleanings and keep track of provider notes.
              </p>
            </div>
          </header>
          <main className="flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search completed bookings"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <BookingsTable
              bookings={filteredBookings}
              emptyMessage="You have no completed appointments yet. They'll show up here once a service is done."
              customActions={(booking) => [
                { label: "Edit review", onSelect: () => handleEditReview(booking) },
                { label: "View details", onSelect: () => handleViewDetails(booking) },
                { label: "Add tip", onSelect: () => handleAddTip(booking) },
                { label: "Book again", onSelect: () => handleBookAgain(booking) },
              ]}
            />
          </main>
        </div>
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={(open) => (open ? setReviewDialogOpen(true) : closeReviewDialog())}>
        <DialogContent className="max-w-md rounded-[32px] border-none p-0 shadow-2xl">
          <DialogTitle className="sr-only">Edit booking review</DialogTitle>
          {activeBooking && (
            <div className="flex flex-col gap-6 p-8">
              <div className="space-y-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Your opinion matters</p>
                <h2 className="text-xl font-bold">Help us improve your {activeBooking.service.toLowerCase()} experience</h2>
                <p className="text-sm text-muted-foreground">
                  Share how things went so we can keep delivering spotless service.
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-muted/40 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">{customerName.slice(0, 1) || "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{customerName}</p>
                  <p className="text-xs text-muted-foreground">{formatBookingDateTime(activeBooking)}</p>
                </div>
              </div>
              <div className="space-y-3 text-center">
                <p className="text-sm font-medium text-muted-foreground">How would you rate your recent service?</p>
                <div className="flex justify-center gap-2">
                  {ratingButtons.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`rounded-full border p-2 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        value <= rating ? "border-amber-200 bg-amber-100 text-amber-500" : "border-border bg-background text-muted-foreground"
                      }`}
                      aria-label={`Set rating to ${value} star${value > 1 ? "s" : ""}`}
                    >
                      <Star
                        className="h-6 w-6"
                        strokeWidth={value <= rating ? 0 : 1.5}
                        fill={value <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="review-feedback">
                  Tell us about your experience
                </label>
                <Textarea
                  id="review-feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  rows={4}
                  placeholder="Great service!"
                  className="rounded-2xl border-muted bg-background/80"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={closeReviewDialog}>
                  Maybe later
                </Button>
                <Button className="flex-1" onClick={handleSubmitReview} disabled={!feedback.trim()}>
                  Rate now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPreviousAppointmentsPage;
