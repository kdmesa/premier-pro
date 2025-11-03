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
import { CalendarIcon, Clock, Loader2, CheckCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
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
    image: "https://images.unsplash.com/photo-1600585154526-990dced4b1ff?w=400&h=300&fit=crop",
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
  const navigate = useNavigate();
  
  // Initialize form with react-hook-form and zod
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

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Booking Confirmed!",
        description: `Your ${values.service} has been scheduled for ${format(values.date, 'PPP')} at ${values.time}.`,
      });
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (form.formState.isSubmitSuccessful) {
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
                onClick={() => navigate("/")} 
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
                        <Popover>
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
                              onSelect={field.onChange}
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
                    <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
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
