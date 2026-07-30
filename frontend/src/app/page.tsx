"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Package,
  Plane,
  Ship,
  ShoppingCart,
  Users,
  Globe,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Play,
  Search,
} from "lucide-react";
import api from "@/lib/api";
import { Video } from "@/types";

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchFeaturedVideos();
  }, []);

  const fetchFeaturedVideos = async () => {
    setVideosLoading(true);
    try {
      const response = await api.get('/videos/featured');
      setVideos(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch featured videos:', error);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const convertToEmbedUrl = (youtubeUrl: string): string => {
    const videoIdMatch = youtubeUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    return youtubeUrl;
  };

  const heroServices = [
    {
      icon: ShoppingCart,
      title: "Product Sourcing",
      slug: "product-sourcing",
      description: "Source from China's factories",
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500",
      iconColor: "text-blue-200",
      titleColor: "text-blue-100",
    },
    {
      icon: Package,
      title: "Wholesale Supply",
      slug: "wholesale-supply",
      description: "Bulk products at best prices",
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-500",
      iconColor: "text-purple-200",
      titleColor: "text-purple-100",
    },
    {
      icon: Plane,
      title: "Air Cargo",
      slug: "air-cargo",
      description: "3-7 days fast delivery",
      color: "from-teal-500 to-teal-600",
      iconBg: "bg-teal-500",
      iconColor: "text-teal-200",
      titleColor: "text-teal-100",
    },
    {
      icon: Ship,
      title: "Sea Shipping",
      slug: "sea-shipping",
      description: "30-45 days cost-effective",
      color: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-500",
      iconColor: "text-orange-200",
      titleColor: "text-orange-100",
    },
    {
      icon: Users,
      title: "Hand Carry",
      slug: "hand-carry",
      description: "1-7 days urgent delivery",
      color: "from-pink-500 to-pink-600",
      iconBg: "bg-pink-500",
      iconColor: "text-pink-200",
      titleColor: "text-pink-100",
    },
    {
      icon: Globe,
      title: "Canton Fair",
      slug: "canton-fair",
      description: "Full fair assistance",
      color: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-500",
      iconColor: "text-amber-200",
      titleColor: "text-amber-100",
    },
  ];

  const services = [
    {
      icon: ShoppingCart,
      title: "China Product Sourcing",
      description:
        "Find and procure products directly from Chinese manufacturers. We handle supplier verification and quality control.",
    },
    {
      icon: Package,
      title: "Wholesale Supplies",
      description:
        "Bulk purchasing solutions for retailers and distributors. Get access to a wide range of products at wholesale prices.",
    },
    {
      icon: Plane,
      title: "Air Shipping",
      description:
        "Fast, reliable air freight services. Get your products delivered quickly from China to Bangladesh.",
    },
    {
      icon: Users,
      title: "Hand Carry Service",
      description:
        "Personal delivery option for urgent or sensitive goods. Perfect for time-sensitive and high-value items.",
    },
  ];

  const shippingMethods = [
    {
      icon: Plane,
      title: "Air Freight",
      time: "7-10 Days",
      description: "Fast delivery for urgent shipments",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: Ship,
      title: "Sea Freight",
      time: "35-40 Days",
      description: "Economical for bulk shipments",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Package,
      title: "Hand Carry",
      time: "72 Hours",
      description: "Fastest for small packages",
      color: "from-violet-500 to-violet-600",
    },
  ];

  const whyChooseUs = [
    "Experienced team with deep knowledge of China-Bangladesh trade",
    "Strong network of reliable suppliers and manufacturers",
    "Competitive pricing with transparent costs",
    "End-to-end tracking and customer support",
    "Quality assurance and inspection services",
    "Customs clearance and documentation support",
  ];

  const stats = [
    { value: "500+", label: "Happy Clients", icon: Users },
    { value: "1000+", label: "Orders Delivered", icon: Package },
    { value: "5+", label: "Years Experience", icon: Clock },
    { value: "24/7", label: "Support", icon: Shield },
  ];

  return (
    <div>
      <section className="relative min-h-[60vh] sm:min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900"></div>
        <div 
          className="absolute inset-0 opacity-30" 
          style={{ 
            backgroundImage: "url('/hero-image.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/80"></div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="container mx-auto px-3 md:px-4 lg:px-6 relative z-10 pt-8 md:pt-0 pb-20 md:pb-24">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-4 md:mb-8">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-300 via-white to-green-300 bg-[length:200%_auto] animate-gradient-shift">
                  HELP & BENEFIT TRADE
                </span>
                <span className="block mt-1 md:mt-2 text-base md:text-xl lg:text-2xl font-medium text-yellow-200/90">
                  Your Complete China-Bangladesh Trade Solution
                </span>
              </h1>

              <p className="text-xs md:text-sm lg:text-base text-white/80 mb-3 md:mb-6 max-w-2xl mx-auto leading-relaxed">
                From sourcing to shipping, we handle everything. Choose a service below to get started.
              </p>

            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 mb-4 md:mb-6">
              {heroServices.map((service, index) => (
                <Link key={index} href={`/services/${service.slug}`}>
                  <div className="group bg-slate-800/60 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 lg:p-3 border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer text-center hover:-translate-y-[3px] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center h-[80px] md:h-[100px] lg:h-[100px] overflow-hidden">
                    <div className={`w-9 h-9 md:w-11 md:h-11 lg:w-11 lg:h-11 ${service.iconBg} rounded-md md:rounded-lg flex items-center justify-center mx-auto mb-1 md:mb-1.5 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="text-white" size={18} strokeWidth={1.5} />
                    </div>
                    <h3 className={`${service.titleColor} font-semibold text-[11px] md:text-sm lg:text-sm mb-0 md:mb-0.5 group-hover:brightness-125 transition-all leading-tight whitespace-nowrap`}>
                      {service.title}
                    </h3>
                    <p className="text-slate-400/80 text-[9px] md:text-[11px] lg:text-[11px] leading-tight hidden md:block">
                      {service.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center items-center mt-4 md:mt-12">
              <Link href="/services/product-sourcing">
                <Button
                  size="sm"
                  className="btn-cta-linear w-full sm:w-auto px-4 md:px-6 py-3 md:py-4 bg-red-600/80 backdrop-blur-xl hover:bg-red-500/90 text-white font-semibold tracking-[-0.01em] shadow-[0_0_24px_rgba(239,68,68,0.25),0_8px_32px_-8px_rgba(0,0,0,0.4)] hover:shadow-[0_0_32px_rgba(239,68,68,0.4),0_12px_40px_-8px_rgba(0,0,0,0.5)] border border-red-400/20 hover:border-red-400/40 transition-all duration-500 ease-out hover:-translate-y-[3px]"
                >
                  <Zap className="mr-1.5 md:mr-2" size={17} strokeWidth={2} />
                  <span className="text-xs md:text-sm">Request a Product</span>
                  <ArrowRight className="ml-1 md:ml-2 opacity-70" size={15} strokeWidth={1.5} />
                </Button>
              </Link>
              <Link href="/tracking">
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-glass-linear btn-glass-linear-green w-full sm:w-auto px-4 md:px-6 py-3 md:py-4 bg-green-600/30 backdrop-blur-xl hover:bg-green-500/40 text-white/90 border border-green-500/20 hover:border-green-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_20px_rgba(74,222,128,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] font-medium tracking-[-0.01em] transition-all duration-500 ease-out hover:-translate-y-[3px]"
                >
                  <Search className="mr-1.5 md:mr-2 opacity-70" size={17} strokeWidth={1.5} />
                  <span className="text-xs md:text-sm">Track Shipment / Request</span>
                </Button>
              </Link>
              <Link href="/wholesale-products">
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-glass-linear w-full sm:w-auto px-4 md:px-6 py-3 md:py-4 bg-purple-600/30 backdrop-blur-xl hover:bg-purple-500/40 text-white/90 border border-purple-500/20 hover:border-purple-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] font-medium tracking-[-0.01em] transition-all duration-500 ease-out hover:-translate-y-[3px]"
                >
                  <Package className="mr-1.5 md:mr-2 opacity-70 group-hover:opacity-100" size={17} strokeWidth={1.5} />
                  <span className="text-xs md:text-sm">Wholesale Products</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-full text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,0 600,120 900,60 C1050,30 1150,90 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for all your China-Bangladesh trade needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
            {services.map((service, index) => (
              <Card key={index} className="card-hover group">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8 md:mt-10">
            <Link href="/services">
              <Button size="lg" variant="gradient" className="px-8">
                View All Services
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore <span className="gradient-text">Videos</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Watch our informative videos about China-Bangladesh trade and shipping
            </p>
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="w-full aspect-video" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Play className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No videos available</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {videos.map((video) => (
                  <Card
                    key={video.id}
                    className="card-hover overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={convertToEmbedUrl(video.youtube_url)}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Play className="text-primary ml-1" size={24} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-gray-600">{video.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-6 sm:mt-8 md:mt-10">
                <Link href="/videos">
                  <Button size="lg" variant="gradient" className="px-8">
                    View More Videos
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={convertToEmbedUrl(selectedVideo.youtube_url)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-gray-600">{selectedVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="py-8 sm:py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shipping <span className="gradient-text">Methods</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the shipping method that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {shippingMethods.map((method, index) => (
              <Card
                key={index}
                className="card-hover text-center overflow-hidden group"
              >
                <CardContent className="p-5 sm:p-8 relative">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <method.icon className="text-white" size={36} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{method.title}</h3>
                  <p className="text-3xl font-bold gradient-text mb-2">
                    {method.time}
                  </p>
                  <p className="text-gray-600">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-24 bg-gradient-to-br from-primary via-primary-700 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                Why Choose <span className="text-yellow-300">HELP & BENEFIT TRADE LTD</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-teal-100 mb-4 sm:mb-6 md:mb-8">
                With years of experience in China-Bangladesh trade, we provide
                reliable, efficient, and cost-effective solutions for your
                business.
              </p>
              <ul className="space-y-3 sm:space-y-4">
                {whyChooseUs.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <CheckCircle
                      className="text-green-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform"
                      size={20}
                    />
                    <span className="text-teal-50 group-hover:text-white transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <stat.icon
                    className="mx-auto mb-2 text-yellow-300"
                    size={28}
                  />
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-teal-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-5 sm:p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Start Your{" "}
                <span className="gradient-text">Import Journey</span>?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Let us help you source the best products from China and deliver
                them to your doorstep in Bangladesh.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/product-request">
                  <Button size="lg" variant="glow" className="px-8">
                    <Zap className="mr-2" size={20} />
                    Submit Product Request
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="px-8 border-2">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}