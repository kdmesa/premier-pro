"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Loader2, CheckCircle, CheckCircle2, ArrowRight, CreditCard, Wallet, Lock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import styles from "./BookingPage.module.css";

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter a valid address"),
  service: z.string().min(1, "Please select a service"),
  date: z.date({
    required_error: "A date is required.",
  }),
  time: z.string().min(1, "Please select a time"),
  notes: z.string().optional(),
});

// Payment form schema for online payment
const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(19),
  cardName: z.string().min(2, "Name on card is required"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().min(3, "CVV must be 3 digits").max(4),
});

type PaymentMethod = "cash" | "online" | null;
type BookingStep = "details" | "payment" | "success";

const services = [
  { 
    id: "standard", 
    name: "Standard Cleaning", 
    description: "Basic cleaning for regularly maintained spaces",
    price: 120, 
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    features: ["Dusting & vacuuming", "Bathroom cleaning", "Kitchen cleaning", "Floor mopping"]
  },
  { 
    id: "deep", 
    name: "Deep Cleaning", 
    description: "Thorough cleaning for all areas",
    price: 250, 
    duration: "4-6 hours",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    features: ["Everything in Standard", "Inside appliances", "Baseboards & trim", "Window sills", "Light fixtures"]
  },
  { 
    id: "move", 
    name: "Move In/Out", 
    description: "Complete cleaning for moving",
    price: 350, 
    duration: "4-8 hours",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    features: ["Everything in Deep", "Inside cabinets & drawers", "Closets cleaned", "Walls spot cleaned", "Blinds dusted"]
  },
  { 
    id: "office", 
    name: "Office Cleaning", 
    description: "Professional workspace cleaning",
    price: 200, 
    duration: "3-4 hours",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    features: ["Desk & surface cleaning", "Trash removal", "Floor care", "Restroom cleaning"]
  },
  { 
    id: "carpet", 
    name: "Carpet Cleaning", 
    description: "Deep carpet cleaning service",
    price: 150, 
    duration: "2-3 hours",
    image: "https://blog.woodenstreet.com/images/data/image_upload/1651836491carpet-cleaning-tip-and-trick-banner.jpg",
    features: ["Steam cleaning", "Stain removal", "Deodorizing", "Dries in 4-6 hours"]
  },
  { 
    id: "custom", 
    name: "Custom Package", 
    description: "Tailored to your needs",
    price: 0, 
    duration: "Varies",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=300&fit=crop",
    features: ["Customizable services", "Special requests", "One-time or recurring", "Contact for quote"]
  }
];

const availableTimes = [
  "9:00 AM",
  "11:00 AM",
  "1:00 PM",
  "3:00 PM",
  "5:00 PM",
];

export default function BookingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BookingStep>("details");
  const [bookingData, setBookingData] = useState<z.infer<typeof formSchema> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Initialize booking form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      service: "",
      time: "",
      notes: "",
    },
  });

  // Initialize payment form
  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  // Handle booking form submission - move to payment step
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setBookingData(values);
    setCurrentStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Get service price
  const getServicePrice = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    return service?.price || 0;
  };

  // Calculate total
  const calculateTotal = () => {
    if (!bookingData) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = getServicePrice(bookingData.service);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  // Handle cash payment
  const handleCashPayment = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Booking Confirmed!",
        description: "You've selected cash payment. Please have the exact amount ready on the service date.",
      });
      setCurrentStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle online payment
  const handleOnlinePayment = async (values: z.infer<typeof paymentSchema>) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed successfully.",
      });
      setCurrentStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Your payment could not be processed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  // Success Screen
  if (currentStep === "success") {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className={styles.bookingContainer}>
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <CheckCircle size={48} />
              </div>
              <h2 className={styles.successTitle}>Booking Confirmed!</h2>
              <p className={styles.successText}>
                Thank you for booking with us! We've sent a confirmation to your email.
                Our team will contact you shortly to confirm the details.
              </p>
              <Button 
                onClick={() => router.push("/")} 
                className="px-8 py-6 text-lg"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Screen
  if (currentStep === "payment" && bookingData) {
    const { subtotal, tax, total } = calculateTotal();
    
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className={styles.bookingContainer}>
          <div className="container mx-auto px-4 py-16 max-w-5xl">
            <div className={styles.header}>
              <h1 className={styles.title}>Complete Your Payment</h1>
              <p className={styles.subtitle}>
                Choose your preferred payment method to confirm your booking
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Booking Summary */}
              <div className="md:col-span-1">
                <div className={styles.summaryCard}>
                  <h3 className={styles.summaryTitle}>Booking Summary</h3>
                  <div className={styles.summaryItem}>
                    <strong>Service:</strong> {bookingData.service}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Date:</strong> {format(bookingData.date, "PPP")}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Time:</strong> {bookingData.time}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Address:</strong> {bookingData.address}
                  </div>
                  <div className={styles.divider}></div>
                  <div className={styles.priceRow}>
                    <span>Service Fee:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className={styles.divider}></div>
                  <div className={styles.totalRow}>
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="md:col-span-2">
                <div className={styles.paymentCard}>
                  <h3 className={styles.paymentTitle}>Select Payment Method</h3>

                  {/* Payment Options */}
                  <div className={styles.paymentMethods}>
                    <div
                      className={`${styles.paymentOption} ${paymentMethod === "cash" ? styles.selected : ""}`}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <div className={styles.paymentOptionHeader}>
                        <Wallet className="h-6 w-6" />
                        <div>
                          <h4 className={styles.paymentOptionTitle}>Cash Payment</h4>
                          <p className={styles.paymentOptionDesc}>Pay when service is completed</p>
                        </div>
                      </div>
                      {paymentMethod === "cash" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>

                    <div
                      className={`${styles.paymentOption} ${paymentMethod === "online" ? styles.selected : ""}`}
                      onClick={() => setPaymentMethod("online")}
                    >
                      <div className={styles.paymentOptionHeader}>
                        <CreditCard className="h-6 w-6" />
                        <div>
                          <h4 className={styles.paymentOptionTitle}>Online Payment</h4>
                          <p className={styles.paymentOptionDesc}>Pay securely with credit/debit card</p>
                        </div>
                      </div>
                      {paymentMethod === "online" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  </div>

                  {/* Cash Payment Details */}
                  {paymentMethod === "cash" && (
                    <div className={styles.paymentDetails}>
                      <div className={styles.cashInfo}>
                        <h4 className={styles.infoTitle}>💵 Cash Payment Instructions</h4>
                        <ul className={styles.infoList}>
                          <li>Payment is due upon completion of service</li>
                          <li>Please have exact amount ready: <strong>${total.toFixed(2)}</strong></li>
                          <li>Our cleaner will provide a receipt</li>
                          <li>Gratuity is appreciated but not required</li>
                        </ul>
                      </div>
                      <Button
                        onClick={handleCashPayment}
                        disabled={isProcessing}
                        className="w-full h-12 text-base mt-4"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            Confirm Cash Payment
                            <CheckCircle2 className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Online Payment Form */}
                  {paymentMethod === "online" && (
                    <div className={styles.paymentDetails}>
                      <div className={styles.securityBadge}>
                        <Lock className="h-4 w-4" />
                        <span>Secure Payment - Your information is encrypted</span>
                      </div>

                      <Form {...paymentForm}>
                        <form onSubmit={paymentForm.handleSubmit(handleOnlinePayment)} className="space-y-4">
                          <FormField
                            control={paymentForm.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      placeholder="1234 5678 9012 3456"
                                      className="pl-10"
                                      maxLength={19}
                                      {...field}
                                      onChange={(e) => {
                                        const formatted = formatCardNumber(e.target.value);
                                        field.onChange(formatted);
                                      }}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={paymentForm.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name on Card</FormLabel>
                                <FormControl>
                                  <Input placeholder="JOHN DOE" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={paymentForm.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry Date</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="MM/YY"
                                      maxLength={5}
                                      {...field}
                                      onChange={(e) => {
                                        const formatted = formatExpiryDate(e.target.value);
                                        field.onChange(formatted);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={paymentForm.control}
                              name="cvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="123"
                                      maxLength={4}
                                      {...field}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full h-12 text-base mt-6"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing Payment...
                              </>
                            ) : (
                              <>
                                Pay ${total.toFixed(2)}
                                <Lock className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}

                  {!paymentMethod && (
                    <div className={styles.selectPrompt}>
                      <p>Please select a payment method to continue</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep("details")}
                  className="mt-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Booking Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Booking Details Form
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className={styles.bookingContainer}>
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className={styles.header}>
            <h1 className={styles.title}>Book Your Cleaning</h1>
            <p className={styles.subtitle}>
              Fill out the form below to schedule your professional cleaning service.
              Our team will contact you to confirm your appointment.
            </p>
          </div>

          <div className={styles.formContainer}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className={styles.formGrid}>
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className={styles.formGroup}>
                      <FormLabel className={styles.formLabel}>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          className={styles.formInput}
                          placeholder="John Doe" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className={styles.formGroup}>
                      <FormLabel className={styles.formLabel}>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          className={styles.formInput}
                          placeholder="john@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className={styles.formGroup}>
                      <FormLabel className={styles.formLabel}>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          className={styles.formInput}
                          placeholder="(123) 456-7890" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Field */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className={styles.formGroup}>
                      <FormLabel className={styles.formLabel}>Address</FormLabel>
                      <FormControl>
                        <Input 
                          className={styles.formInput}
                          placeholder="123 Main St, Chicago, IL" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Selection */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.formLabel}>Service Type</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          {services.map((service) => (
                            <div 
                              key={service.id} 
                              className={cn(
                                styles.serviceCard,
                                field.value === service.name && styles.selected
                              )}
                              onClick={() => field.onChange(service.name)}
                            >
                              <div className={styles.serviceImageWrapper}>
                                <img 
                                  src={service.image} 
                                  alt={service.name}
                                  className={styles.serviceCardImage}
                                  loading="lazy"
                                />
                              </div>
                              <div className={styles.serviceCardContent}>
                                <div className={styles.serviceHeader}>
                                  <div className={styles.serviceName}>{service.name}</div>
                                  {service.price > 0 ? (
                                    <div className={styles.servicePrice}>${service.price}+</div>
                                  ) : (
                                    <div className={styles.servicePrice}>Get Quote</div>
                                  )}
                                </div>
                                <div className={styles.serviceDescription}>{service.description}</div>
                                <div className={styles.serviceDuration}>
                                  <Clock className="h-4 w-4 mr-1 inline" />
                                  {service.duration}
                                </div>
                                <div className={styles.serviceFeatures}>
                                  {service.features.map((feature, index) => (
                                    <div key={index} className={styles.featureItem}>
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 inline" />
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date Picker */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className={styles.formLabel}>Select Date</FormLabel>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal h-12",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className={styles.calendarWrapper} align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setCalendarOpen(false);
                              }}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Time Selection */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.formLabel}>Select Time Slot</FormLabel>
                        <div className={styles.timeSlots}>
                          {availableTimes.map((time) => (
                            <div
                              key={time}
                              className={cn(
                                styles.timeSlot,
                                field.value === time && styles.selected
                              )}
                              onClick={() => field.onChange(time)}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

                {/* Additional Notes */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className={styles.formGroup}>
                        <FormLabel className={styles.formLabel}>
                          Additional Notes (Optional)
                          <span className="text-muted-foreground text-sm font-normal block mt-1">
                            Any special instructions or requests?
                          </span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            className={styles.formTextarea}
                            placeholder="e.g., Please bring extra cleaning supplies, focus on kitchen, pet in the house, etc."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="col-span-full pt-4">
                  <button 
                    type="submit"
                    className={`${styles.submitButton} group`}
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    By booking, you agree to our{' '}
                    <Link href="/terms-and-conditions" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                    <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
