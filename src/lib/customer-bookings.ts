export const BOOKINGS_STORAGE_KEY = "customerBookings";

export type BookingStatus = "scheduled" | "completed" | "canceled";

export type Booking = {
  id: string;
  service: string;
  provider: string;
  frequency: string;
  date: string; // yyyy-mm-dd format
  time: string;
  status: BookingStatus;
  address: string;
  contact: string;
  notes: string;
  price: number;
};

export const defaultBookings: Booking[] = [
  {
    id: "CB-101",
    service: "Deep Cleaning",
    provider: "Marie Sanders",
    frequency: "Weekly",
    date: "2025-01-12",
    time: "09:00 AM",
    status: "scheduled",
    address: "123 Main St, Chicago, IL",
    contact: "(555) 123-4567",
    notes: "Focus on kitchen appliances.",
    price: 240,
  },
  {
    id: "CB-102",
    service: "Standard Cleaning",
    provider: "Jason Wu",
    frequency: "2x per week",
    date: "2025-01-19",
    time: "11:30 AM",
    status: "scheduled",
    address: "123 Main St, Chicago, IL",
    contact: "(555) 123-4567",
    notes: "Pet-friendly solutions.",
    price: 165,
  },
  {
    id: "CB-099",
    service: "Move-Out Cleaning",
    provider: "Kyla Brooks",
    frequency: "One-time",
    date: "2025-01-25",
    time: "02:00 PM",
    status: "completed",
    address: "123 Main St, Chicago, IL",
    contact: "(555) 123-4567",
    notes: "Tenant inspection ready.",
    price: 320,
  },
  {
    id: "CB-097",
    service: "Office Refresh",
    provider: "Lee Carter",
    frequency: "Monthly",
    date: "2025-01-05",
    time: "01:00 PM",
    status: "canceled",
    address: "22 Business Plaza, Chicago, IL",
    contact: "(555) 222-7865",
    notes: "Canceled per customer request.",
    price: 450,
  },
];

const defaultMetaById = Object.fromEntries(
  defaultBookings.map((booking) => [booking.id, {
    price: booking.price,
    provider: booking.provider,
    frequency: booking.frequency,
  }]),
);

const normalizeBooking = (booking: Booking | Partial<Booking>) => {
  const defaults =
    defaultMetaById[booking.id as keyof typeof defaultMetaById] ?? { price: 0, provider: "", frequency: "" };
  const provider = (booking.provider ?? defaults.provider ?? "").trim();
  const frequency = (booking.frequency ?? defaults.frequency ?? "").trim();

  return {
    ...booking,
    provider: provider || "Premier Pro Team",
    frequency: frequency || defaults.frequency || "One-time",
    price:
      typeof booking.price === "number" && !Number.isNaN(booking.price)
        ? booking.price
        : defaults.price ?? 0,
  } as Booking;
};

export const persistBookings = (bookings: Booking[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings.map(normalizeBooking)));
};

export const readStoredBookings = (): Booking[] => {
  if (typeof window === "undefined") {
    return defaultBookings;
  }

  const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
  if (!stored) {
    persistBookings(defaultBookings);
    return defaultBookings;
  }

  try {
    const parsed = JSON.parse(stored) as (Booking | Partial<Booking>)[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      const normalized = parsed.map((booking) => normalizeBooking(booking));
      persistBookings(normalized);
      return normalized;
    }
    persistBookings(defaultBookings);
    return defaultBookings;
  } catch (error) {
    console.warn("Failed to parse stored bookings", error);
    persistBookings(defaultBookings);
    return defaultBookings;
  }
};
