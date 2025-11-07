'use client'

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSectionClick = (sectionId: string) => {
    if (pathname !== '/') {
      // If not on home page, navigate to home first, then scroll
      router.push('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <img src="/images/logo.png" alt="Premier Pro Cleaners" className="h-12 w-12" />
            <span className="text-xl font-bold gradient-text">Premier Pro Cleaners</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleSectionClick('how-it-works')} 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleSectionClick('services')} 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Services
            </button>
            <button 
              onClick={() => handleSectionClick('reviews')} 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <button 
              onClick={() => handleSectionClick('contact')} 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Contact
            </button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/book-now">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <button
              onClick={() => handleSectionClick('how-it-works')}
              className="block text-foreground hover:text-primary transition-colors w-full text-left"
            >
              How It Works
            </button>
            <button
              onClick={() => handleSectionClick('services')}
              className="block text-foreground hover:text-primary transition-colors w-full text-left"
            >
              Services
            </button>
            <button
              onClick={() => handleSectionClick('reviews')}
              className="block text-foreground hover:text-primary transition-colors w-full text-left"
            >
              Reviews
            </button>
            <button
              onClick={() => handleSectionClick('contact')}
              className="block text-foreground hover:text-primary transition-colors w-full text-left"
            >
              Contact
            </button>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/book-now">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
