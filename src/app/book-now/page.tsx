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
import ServiceCard, { ServiceCustomization } from "@/components/ServiceCard";
import styles from "./BookingPage.module.css";

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter a valid address"),
  zipCode: z.string().min(5, "Please enter a valid zip code").max(10),
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
type BookingStep = "category" | "details" | "payment" | "success";
type ServiceCategory = "home" | "carpet" | null;

const servicesByCategory = {
  home: [
    { 
      id: "standard", 
      name: "Standard Cleaning", 
      description: "A regular cleaning service to keep your home neat and comfortable. Includes dusting, mopping, and surface cleaning to maintain a fresh living space.",
      price: 120, 
      duration: "2-3 hours",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    },
    { 
      id: "deep", 
      name: "Deep Cleaning", 
      description: "An intensive cleaning that reaches hidden dirt and grime. Covers floors, corners, surfaces, and areas that are often overlooked for a thoroughly refreshed home.",
      price: 200, 
      duration: "4-6 hours",
      image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=300&fit=crop",
      features: ["Everything in standard", "Appliance cleaning", "Baseboard cleaning", "Window cleaning"]
    },
    { 
      id: "move", 
      name: "Move In/Out Cleaning", 
      description: "A comprehensive cleaning service to prepare your home for a fresh start. Every room and surface is cleaned to ensure the space is spotless and ready for moving in or out.",
      price: 250, 
      duration: "6-8 hours",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    },
  ],
  carpet: [
    { 
      id: "standard-carpet", 
      name: "Standard Cleaning", 
      description: "Basic carpet cleaning for regular maintenance",
      price: 120, 
      duration: "2-3 hours",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      features: ["Vacuum cleaning", "Spot treatment", "Deodorizing", "Quick dry"]
    },
    { 
      id: "deep-carpet", 
      name: "Deep Cleaning", 
      description: "Intensive carpet cleaning with steam",
      price: 200, 
      duration: "3-4 hours",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      features: ["Steam cleaning", "Deep stain removal", "Sanitization", "Deodorizing"]
    },
    { 
      id: "move-carpet", 
      name: "Move In/Out Cleaning", 
      description: "Complete carpet restoration for moving",
      price: 250, 
      duration: "4-6 hours",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      features: ["Full steam cleaning", "Stain protection", "Upholstery cleaning", "Odor elimination"]
    },
  ],
};

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
  const [currentStep, setCurrentStep] = useState<BookingStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceCustomization, setServiceCustomization] = useState<ServiceCustomization | null>(null);
  const [bookingData, setBookingData] = useState<z.infer<typeof formSchema> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [cardCustomizations, setCardCustomizations] = useState<Record<string, ServiceCustomization>>({});
  
  // Initialize booking form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      zipCode: "",
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

  // Handle category selection
  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setCurrentStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle card flip
  const handleCardFlip = (cardId: string) => {
    // If flipping to a different card, clear the previous card's data if it wasn't confirmed
    if (flippedCardId && flippedCardId !== cardId && selectedService?.id !== flippedCardId) {
      setCardCustomizations(prev => {
        const newCustomizations = { ...prev };
        delete newCustomizations[flippedCardId];
        return newCustomizations;
      });
    }
    setFlippedCardId(cardId || null);
  };

  // Handle customization change for a specific card
  const handleCustomizationChange = (serviceId: string, customization: ServiceCustomization) => {
    // Only update if this card is currently flipped
    if (flippedCardId === serviceId) {
      setCardCustomizations(prev => ({
        ...prev,
        [serviceId]: customization
      }));
    }
  };

  // Get customization for a specific card
  const getCardCustomization = (serviceId: string): ServiceCustomization => {
    return cardCustomizations[serviceId] || {
      frequency: "",
      squareMeters: "",
      bedroom: "",
      bathroom: "",
      extras: "",
      isPartialCleaning: false,
      excludedAreas: [],
    };
  };

  // Handle service selection
  const handleServiceSelect = (serviceName: string, customization?: ServiceCustomization) => {
    if (!selectedCategory) return;
    const services = servicesByCategory[selectedCategory];
    const service = services.find(s => s.name === serviceName);
    if (service && customization) {
      setSelectedService(service);
      setServiceCustomization(customization);
      form.setValue("service", serviceName);
      
      // Scroll to customer form after a short delay
      setTimeout(() => {
        const formElement = document.getElementById('customer-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  // Handle booking form submission - move to payment step
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setBookingData(values);
    setCurrentStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Get service price
  const getServicePrice = (serviceName: string) => {
    if (!selectedCategory) return 0;
    const services = servicesByCategory[selectedCategory];
    const service = services?.find(s => s.name === serviceName);
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

  // Category Selection Screen
  if (currentStep === "category") {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className={styles.bookingContainer}>
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className={styles.header}>
              <h1 className={styles.title}>Select Service Category</h1>
              <p className={styles.subtitle}>
                Choose between Home Cleaning or Carpet Cleaning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {/* Home Cleaning Card */}
              <div 
                onClick={() => handleCategorySelect("home")}
                className={`${styles.categoryCard} ${selectedCategory === "home" ? styles.selected : ""}`}
              >
                <div className={styles.categoryIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <h3 className={styles.categoryTitle}>Home Cleaning</h3>
                <p className={styles.categoryDescription}>
                  Professional cleaning services for your home including standard, deep, and move in/out cleaning
                </p>
              </div>

              {/* Carpet Cleaning Card */}
              <div 
                onClick={() => handleCategorySelect("carpet")}
                className={`${styles.categoryCard} ${selectedCategory === "carpet" ? styles.selected : ""}`}
              >
                <div className={styles.categoryIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <h3 className={styles.categoryTitle}>Carpet Cleaning</h3>
                <p className={styles.categoryDescription}>
                  Specialized carpet cleaning services including standard, deep, and move in/out carpet care
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  if (currentStep === "payment" && bookingData && selectedService && serviceCustomization) {
    const { subtotal, tax, total } = calculateTotal();
    
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className={styles.bookingContainer}>
          <div className="container mx-auto px-4 py-16 max-w-6xl">
            <div className={styles.header}>
              <h1 className={styles.title}>Complete Your Payment</h1>
              <p className={styles.subtitle}>
                Review your booking and complete payment
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Booking Summary Sidebar */}
              <div className="md:col-span-1">
                <div className={styles.summaryCard}>
                  <h3 className={styles.summaryTitle}>Booking Summary</h3>
                  <div className={styles.summaryItem}>
                    <strong>Category:</strong> {selectedCategory === "home" ? "Home Cleaning" : "Carpet Cleaning"}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Service:</strong> {selectedService.name}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Frequency:</strong> {serviceCustomization.frequency}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Area Size:</strong> {serviceCustomization.squareMeters}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Bedroom:</strong> {serviceCustomization.bedroom}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Bathroom:</strong> {serviceCustomization.bathroom}
                  </div>
                  {serviceCustomization.extras && serviceCustomization.extras !== "None" && (
                    <div className={styles.summaryItem}>
                      <strong>Extras:</strong> {serviceCustomization.extras}
                    </div>
                  )}
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
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("details")}
                    className="w-full mt-4"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Details
                  </Button>
                </div>
              </div>

              {/* Payment Form */}
              <div className="md:col-span-2">
                <div className={styles.paymentCard}>
                  <h3 className={styles.paymentTitle}>Payment Information</h3>

                  {/* Online Payment Form */}
                  <div className={styles.securityBadge}>
                    <Lock className="h-4 w-4" />
                    <span>Secure Payment - Your information is encrypted</span>
                  </div>

                  <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(handleOnlinePayment)} className="space-y-4 mt-4">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Booking Details Form
  if (currentStep === "details" && selectedCategory) {
    const categoryServices = servicesByCategory[selectedCategory];
    const showSummary = selectedService && serviceCustomization;
    const { subtotal, tax, total } = showSummary ? calculateTotal() : { subtotal: 0, tax: 0, total: 0 };
    
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className={styles.bookingContainer}>
          <div className="container mx-auto px-4 py-16 max-w-6xl">
            <div className={styles.header}>
              <h1 className={styles.title}>
                {selectedCategory === "home" ? "Home Cleaning" : "Carpet Cleaning"} Booking
              </h1>
              <p className={styles.subtitle}>
                {showSummary 
                  ? `Complete your booking details for ${selectedService.name}`
                  : "Select a service type and fill out your booking details"
                }
              </p>
            </div>

            {/* Service Type Selection - Always show flip cards */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Select Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categoryServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedService?.id === service.id}
                    onSelect={handleServiceSelect}
                    flippedCardId={flippedCardId}
                    onFlip={handleCardFlip}
                    customization={getCardCustomization(service.id)}
                    onCustomizationChange={handleCustomizationChange}
                  />
                ))}
              </div>
            </div>

            {/* Customer Information Form - Always visible below service cards */}
            <div id="customer-form" className={styles.formContainer}>
              <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
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

                {/* Zip Code Field */}
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className={styles.formGroup}>
                      <FormLabel className={styles.formLabel}>Zip Code</FormLabel>
                      <FormControl>
                        <Input 
                          className={styles.formInput}
                          placeholder="60601" 
                          maxLength={10}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

  // Fallback - redirect to service selection if accessed directly
  return null;
}
