"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  Calendar,
  Award,
  Edit,
  Camera,
  Lock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const services = [
  { id: 1, name: "Deep Cleaning", selected: true },
  { id: 2, name: "Standard Cleaning", selected: true },
  { id: 3, name: "Office Cleaning", selected: true },
  { id: 4, name: "Carpet Cleaning", selected: true },
  { id: 5, name: "Move In/Out Cleaning", selected: false },
  { id: 6, name: "Window Cleaning", selected: false },
];

const reviews = [
  {
    id: 1,
    rating: 5,
    comment: "Excellent service! Very thorough and professional.",
    date: "2025-12-05",
    service: "Deep Cleaning"
  },
  {
    id: 2,
    rating: 5,
    comment: "Great job! Will definitely book again.",
    date: "2025-12-04",
    service: "Standard Cleaning"
  },
  {
    id: 3,
    rating: 4,
    comment: "Good service overall, arrived on time.",
    date: "2025-12-03",
    service: "Office Cleaning"
  },
  {
    id: 4,
    rating: 5,
    comment: "Outstanding! My carpets look brand new.",
    date: "2025-12-02",
    service: "Carpet Cleaning"
  },
];

const ProviderProfile = () => {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [providerName, setProviderName] = useState("John Smith");
  const [email, setEmail] = useState("provider@orbitbooking.com");
  const [phone, setPhone] = useState("(555) 123-4567");
  const [location, setLocation] = useState("New York, NY");
  const [bio, setBio] = useState("Professional cleaning service provider. Specialized in residential and commercial cleaning.");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResetPassword = async () => {
    try {
      setIsResetting(true);
      // Simulate API call to request password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Password Reset Requested",
        description: "Your request to reset the password has been sent to the admin. You will receive an email with further instructions.",
      });
      
      // Close the dialog
      setIsResetDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("providerName");
    const storedEmail = localStorage.getItem("providerEmail");
    const storedImage = localStorage.getItem("providerProfileImage");
    if (name) setProviderName(name);
    if (storedEmail) setEmail(storedEmail);
    if (storedImage) setProfileImage(storedImage);
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem("providerName", providerName);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem("providerProfileImage", base64String);
        toast({
          title: "Profile Image Updated",
          description: "Your profile image has been successfully updated.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const averageRating = (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile and service offerings</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                    {providerName.charAt(0)}
                  </div>
                )}
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="profile-image-upload"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Camera className="h-5 w-5" />
                </label>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
                  <span className="font-bold text-lg">{averageRating}</span>
                </div>
                <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                    <Input
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Location</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bio</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{providerName}</h2>
                    <p className="text-muted-foreground">{bio}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Member since Nov 2024</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {mounted && (
                      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                            <Lock className="h-4 w-4 mr-2" />
                            Reset Password
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-red-100">
                              <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <DialogTitle>Reset Your Password</DialogTitle>
                              <DialogDescription className="mt-1">
                                Request admin to reset your password
                              </DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            A request will be sent to the admin to reset your password. You will receive an email with further instructions once the admin approves your request.
                          </p>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-amber-700 dark:text-amber-400 text-sm">
                            <p>Note: For security reasons, the admin will need to approve your password reset request before you can set a new password.</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsResetDialogOpen(false)}
                            disabled={isResetting}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleResetPassword}
                            disabled={isResetting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isResetting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending Request...
                              </>
                            ) : (
                              'Request Password Reset'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Processor */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Processor</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your payment processor to receive payments
          </p>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.976 9.5H22.5L28 0H0L5.5 9.5H13.5V14.5H0L5.5 24H14L8.5 14.5H13.976V9.5Z" fill="#635bff"/>
                  </svg>
                  Stripe Connect
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Securely connect your Stripe account to receive payments directly
                </p>
              </div>
              <Button 
                variant="outline"
                className="bg-white border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.976 9.5H22.5L28 0H0L5.5 9.5H13.5V14.5H0L5.5 24H14L8.5 14.5H13.976V9.5Z" fill="currentColor"/>
                </svg>
                Connect with Stripe
              </Button>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Connect your Stripe account to start receiving payments.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            What customers are saying about you
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <p className="text-sm">{review.comment}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400">
                    {review.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderProfile;
