"use client";

import { useEffect, useState } from "react";
import SignupForm from "@/components/events/SignupForm";
import { ArrowDown, ChevronLeft, ChevronRight, FileText, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import ErrorBoundary from "@/components/events/ErrorBoundary";
import { ThemeProvider } from "@/components/events/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const eventImages = [
  {
    src: "/images/events/event1.jpg",
    title: "Auto Exhibition Hall",
    description: "Explore the massive exhibition hall featuring cutting-edge automotive technology",
  },
  {
    src: "/images/events/event2.jpg",
    title: "Product Showcase",
    description: "Discover the latest automotive aftermarket products and innovations",
  },
  {
    src: "/images/events/event3.png",
    title: "Networking Event",
    description: "Connect with industry leaders and professionals from around the globe",
  },
];

function EventsPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsHeroVisible(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % eventImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + eventImages.length) % eventImages.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen bg-background">
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background">
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="2" fill="currentColor" />
                        <circle cx="90" cy="10" r="2" fill="currentColor" />
                        <circle cx="10" cy="90" r="2" fill="currentColor" />
                        <circle cx="90" cy="90" r="2" fill="currentColor" />
                        <line x1="10" y1="10" x2="90" y2="10" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="90" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="90" y1="90" x2="10" y2="90" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="10" y1="90" x2="10" y2="10" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="1200" height="600" fill="url(#circuit)" />
                  </svg>
                </div>

                <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
              </div>

              <div className="relative z-10 container max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="hidden md:flex flex-col items-center justify-center">
                  <div className="relative w-64 h-64 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <defs>
                        <linearGradient id="engGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#e63946" />
                          <stop offset="100%" stopColor="#0066ff" />
                        </linearGradient>
                      </defs>
                      <g transform="translate(100, 100)">
                        <rect x="-50" y="-40" width="100" height="80" fill="none" stroke="url(#engGrad)" strokeWidth="3" rx="8" />
                        <rect x="-40" y="-30" width="80" height="60" fill="none" stroke="#334155" strokeWidth="2" rx="6" />
                        
                        <circle cx="-20" cy="-10" r="12" fill="none" stroke="#e63946" strokeWidth="2" />
                        <circle cx="0" cy="-10" r="12" fill="none" stroke="#e63946" strokeWidth="2" />
                        <circle cx="20" cy="-10" r="12" fill="none" stroke="#e63946" strokeWidth="2" />
                        
                        <circle cx="-20" cy="-10" r="4" fill="#e63946" className="animate-pulse" />
                        <circle cx="0" cy="-10" r="4" fill="#e63946" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                        <circle cx="20" cy="-10" r="4" fill="#e63946" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                        
                        <circle cx="0" cy="30" r="15" fill="none" stroke="#0066ff" strokeWidth="2" className="animate-spin" style={{ animationDuration: '3s' }} />
                        <circle cx="0" cy="30" r="8" fill="none" stroke="#334155" strokeWidth="1" />
                      </g>
                    </svg>
                  </div>

                  <div className="mt-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-primary">AUTOMOTIVE INNOVATION</p>
                    <p className="text-xs text-muted-foreground">24th Edition • Zhengzhou • 2026</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                      Join the <span className="text-primary">2026 CIAAF</span> Zhengzhou
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      The 24th China International Auto Aftermarket Fair brings together industry leaders, innovators, and professionals from around the globe. Register now to participate in this premier B2B event.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-6 bg-primary mt-1"></div>
                      <div>
                        <p className="font-semibold">100,000+ Annual Visitors</p>
                        <p className="text-sm text-muted-foreground">Wholesalers, distributors, retailers, and industry leaders</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-6 bg-secondary mt-1"></div>
                      <div>
                        <p className="font-semibold">3,000+ Exhibitors</p>
                        <p className="text-sm text-muted-foreground">Domestic and international automotive aftermarket suppliers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-6 bg-primary mt-1"></div>
                      <div>
                        <p className="font-semibold">UFI Certified</p>
                        <p className="text-sm text-muted-foreground">Recognized by the Global Association of the Exhibition Industry</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={scrollToForm}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span>Register Now</span>
                      <ArrowDown className="w-5 h-5 animate-bounce" />
                    </button>
                  </div>
                </div>
              </div>

              {isHeroVisible && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <ArrowDown className="w-6 h-6 text-primary" />
                </div>
              )}
            </section>

            <div className="relative h-32 bg-gradient-to-b from-background to-card overflow-hidden pointer-events-none">
              <svg className="absolute w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" style={{ filter: "drop-shadow(0 -10px 20px rgba(0, 0, 0, 0.05))" }}>
                <polygon points="0,50 1200,0 1200,200 0,200" fill="currentColor" className="text-card" />
              </svg>
            </div>

            <section className="py-16 md:py-24 bg-background">
              <div className="container max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Gallery</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Experience the vibrant atmosphere of CIAAF through our exclusive photo gallery
                  </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                    {eventImages.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ${index === activeImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <img
                          src={image.src}
                          alt={image.title}
                          className={`w-full h-full object-cover transition-transform duration-500 ${hoveredCard === index ? 'scale-110' : 'scale-100'}`}
                        />
                        
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}`}>
                          <div className={`absolute bottom-0 left-0 right-0 p-8 transition-transform duration-300 ${hoveredCard === index ? 'translate-y-0' : 'translate-y-4'}`}>
                            <h3 className="text-2xl font-bold text-white mb-2">{image.title}</h3>
                            <p className="text-gray-200">{image.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={prevImage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div className="flex justify-center gap-2 mt-6">
                    {eventImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === activeImageIndex
                            ? 'bg-primary w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="relative h-32 bg-gradient-to-b from-background to-card overflow-hidden pointer-events-none">
              <svg className="absolute w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" style={{ filter: "drop-shadow(0 -10px 20px rgba(0, 0, 0, 0.05))" }}>
                <polygon points="0,0 1200,50 1200,200 0,200" fill="currentColor" className="text-card" />
              </svg>
            </div>

            <section className="bg-background py-16 md:py-24">
              <div className="container max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Brochure</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Download or read the official 2026 CIAAF (Zhengzhou) exhibition brochure
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <button
                    onClick={() => setShowPdfViewer(true)}
                    className="w-full group relative overflow-hidden rounded-2xl border-2 border-primary/20 hover:border-primary transition-all duration-300 bg-card p-8 text-left"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                          2026 CIAAF Zhengzhou Exhibition Brochure
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          24th China International Auto Aftermarket Fair — Official Event Guide
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            <Maximize2 size={12} /> Click to Read
                          </span>
                          <span className="text-xs text-muted-foreground">PDF Document</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </section>

            {showPdfViewer && (
              <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white shrink-0">
                  <div className="flex items-center gap-3">
                    <FileText size={20} />
                    <h3 className="font-semibold text-sm md:text-base">2026 CIAAF Zhengzhou Exhibition Brochure</h3>
                  </div>
                  <button
                    onClick={() => setShowPdfViewer(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
                  >
                    <X size={18} />
                    <span className="hidden sm:inline">Close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <iframe
                    src="/events/2026-CIAAF-Zhengzhou-Brochure.pdf"
                    className="w-full h-full border-0"
                    title="2026 CIAAF Zhengzhou Exhibition Brochure"
                  />
                </div>
              </div>
            )}

            <section className="bg-card py-16 md:py-24" id="registration-form">
              <div className="container max-w-4xl mx-auto px-4">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Registration</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Complete your registration to secure your spot at the 2026 CIAAF (Zhengzhou). Please provide accurate information for verification purposes.
                  </p>
                </div>

                <SignupForm />
              </div>
            </section>

            <footer className="bg-background border-t border-border py-12">
              <div className="container max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">2026 CIAAF (Zhengzhou)</h3>
                    <p className="text-sm text-muted-foreground">
                      The 24th China International Auto Aftermarket Fair - A premier B2B platform for automotive industry professionals.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Event Details</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><strong>Dates:</strong> June 26-28, 2026</li>
                      <li><strong>Location:</strong> Zhengzhou, China</li>
                      <li><strong>Venue:</strong> Central China International Convention & Exhibition Center (Zhengzhou Airport Economy Zone)</li>
                      <li><strong>Edition:</strong> 24th CIAAF</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Email: info@ciaaf.com</li>
                      <li>Phone: +86 (0) 371-XXXX-XXXX</li>
                      <li>Website: www.ciaaf.com</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-border pt-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      © 2026 CIAAF (Zhengzhou). All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                      <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                      <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default EventsPage;