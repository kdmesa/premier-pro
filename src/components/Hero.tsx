'use client'

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Clock } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section 
      id="home"
      className="relative pt-20 pb-16 px-4 min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: `url('/images/hero-background-chicago.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Trust badges - Centered */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 animate-slide-up">
            <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-full bg-white/90">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-900">Trusted Professionals</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-full bg-white/90">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-900">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-full bg-white/90">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-900">Premium Service</span>
            </div>
          </div>

          {/* Centered content */}
          <div className="flex justify-center items-center">
            {/* Text content - Centered */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="mb-6">
                <span className="px-6 py-3 bg-white/95 border-2 border-primary rounded-full text-primary font-semibold text-sm tracking-wider shadow-lg">
                  CHICAGO'S #1 CLEANING SERVICE
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-sans font-extrabold mb-6 leading-tight">
                <span className="block text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  Thanks For
                </span>
                <span className="block text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  Stopping By
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-navy mb-4 font-bold drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]">
                Let Us Connect You With Top Providers
              </p>
              
              <p className="text-base md:text-lg text-white/95 mb-10 font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] max-w-3xl mx-auto">
                Experience hassle-free booking with instant confirmation, vetted professionals, and premium service quality.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-5 mb-12">
                <Button asChild size="lg" className="text-lg px-10 py-6 gradient-primary hover:scale-105 transition-all shadow-xl hover:shadow-2xl rounded-full group">
                  <Link href="/book-now">
                    Book Appointment
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-10 py-6 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all rounded-full backdrop-blur-sm"
                >
                  <a href="#contact">
                    Contact Us
                  </a>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-primary/40 max-w-2xl mx-auto">
                <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mb-2">10K+</div>
                  <div className="text-xs md:text-sm text-navy font-bold drop-shadow-[0_2px_6px_rgba(255,255,255,0.8)] bg-white/90 px-3 py-1 rounded-full inline-block">Happy Clients</div>
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mb-2">500+</div>
                  <div className="text-xs md:text-sm text-navy font-bold drop-shadow-[0_2px_6px_rgba(255,255,255,0.8)] bg-white/90 px-3 py-1 rounded-full inline-block">Pro Cleaners</div>
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mb-2">4.9★</div>
                  <div className="text-xs md:text-sm text-navy font-bold drop-shadow-[0_2px_6px_rgba(255,255,255,0.8)] bg-white/90 px-3 py-1 rounded-full inline-block">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
