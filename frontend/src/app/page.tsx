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
      iconBg: "bg-slate-800",
      hoverBorder: "hover:border-slate-800/30",
      hoverArrow: "group-hover:text-slate-800",
    },
    {
      icon: Package,
      title: "Wholesale Supply",
      slug: "wholesale-supply",
      description: "Bulk products at best prices",
      iconBg: "bg-amber-500",
      hoverBorder: "hover:border-amber-500/30",
      hoverArrow: "group-hover:text-amber-600",
    },
    {
      icon: Plane,
      title: "Air Cargo",
      slug: "air-cargo",
      description: "3-7 days fast delivery",
      iconBg: "bg-sky-500",
      hoverBorder: "hover:border-sky-500/30",
      hoverArrow: "group-hover:text-sky-600",
    },
    {
      icon: Ship,
      title: "Sea Shipping",
      slug: "sea-shipping",
      description: "30-45 days cost-effective",
      iconBg: "bg-cyan-600",
      hoverBorder: "hover:border-cyan-600/30",
      hoverArrow: "group-hover:text-cyan-700",
    },
    {
      icon: Users,
      title: "Hand Carry",
      slug: "hand-carry",
      description: "1-7 days urgent delivery",
      iconBg: "bg-red-500",
      hoverBorder: "hover:border-red-500/30",
      hoverArrow: "group-hover:text-red-600",
    },
    {
      icon: Globe,
      title: "Canton Fair",
      slug: "canton-fair",
      description: "Full fair assistance",
      iconBg: "bg-emerald-600",
      hoverBorder: "hover:border-emerald-600/30",
      hoverArrow: "group-hover:text-emerald-700",
    },
  ];

  const services = [
    {
      icon: ShoppingCart,
      title: "China Product Sourcing",
      description:
        "Find and procure products directly from Chinese manufacturers. We handle supplier verification and quality control.",
      iconBg: "bg-gradient-to-br from-slate-700 to-slate-900",
    },
    {
      icon: Package,
      title: "Wholesale Supplies",
      description:
        "Bulk purchasing solutions for retailers and distributors. Get access to a wide range of products at wholesale prices.",
      iconBg: "bg-gradient-to-br from-amber-400 to-amber-600",
    },
    {
      icon: Plane,
      title: "Air Shipping",
      description:
        "Fast, reliable air freight services. Get your products delivered quickly from China to Bangladesh.",
      iconBg: "bg-gradient-to-br from-sky-400 to-sky-600",
    },
    {
      icon: Users,
      title: "Hand Carry Service",
      description:
        "Personal delivery option for urgent or sensitive goods. Perfect for time-sensitive and high-value items.",
      iconBg: "bg-gradient-to-br from-red-400 to-red-600",
    },
  ];

  const shippingMethods = [
    {
      icon: Plane,
      title: "Air Freight",
      time: "7-10 Days",
      description: "Fast delivery for urgent shipments",
      color: "from-sky-500 to-blue-600",
      timeColor: "text-sky-600",
    },
    {
      icon: Ship,
      title: "Sea Freight",
      time: "35-40 Days",
      description: "Economical for bulk shipments",
      color: "from-cyan-500 to-teal-600",
      timeColor: "text-cyan-600",
    },
    {
      icon: Package,
      title: "Hand Carry",
      time: "72 Hours",
      description: "Fastest for small packages",
      color: "from-red-500 to-rose-600",
      timeColor: "text-red-600",
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
      <section className="relative min-h-[60vh] sm:min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-slate-900">
        {/* Mobile hero image - user's phone banner */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-center md:hidden"
          style={{
            backgroundImage: "url('/hb%20trade%20phone%20banner.png')"
          }}
        ></div>
        {/* Desktop hero image - user's PC banner */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-center hidden md:block"
          style={{
            backgroundImage: "url('/hb%20trade%20pc%20banner.png')"
          }}
        ></div>
        {/* Light radial shadow behind content area + gentle top/bottom scrim for readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.15)_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 pt-10 md:pt-0 pb-20 md:pb-24">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-5 md:mb-8">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 md:mb-3 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                <span className="text-white">
                  HELP & BENEFIT TRADE
                </span>
                <span className="block mt-2 md:mt-3 text-base md:text-xl lg:text-2xl font-semibold text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                  Your Complete China-Bangladesh Trade Solution
                </span>
              </h1>

              <p className="text-xs md:text-base text-white mb-4 md:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,0.9)]">
                From sourcing to shipping, we handle everything. Choose a service below to get started.
              </p>

            </div>

            {/* Action Buttons - solid distinct colors, no transparency, mobile compact */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center mt-4 sm:mt-10 px-4 sm:px-0">
              <Link href="/services/product-sourcing" className="w-auto sm:w-auto">
                <Button
                  size="sm"
                  variant="default"
                  className="px-4 sm:px-6 py-2 sm:py-3.5 !bg-red-600 hover:!bg-red-700 !text-white font-semibold !shadow-lg !shadow-red-800/40 hover:!shadow-xl hover:!shadow-red-800/50 transition-all duration-300 ease-out hover:-translate-y-0.5 rounded-lg sm:rounded-xl !opacity-100 !border-0 text-xs sm:text-sm"
                >
                  <Zap className="mr-1.5 sm:mr-2" size={14} strokeWidth={2} />
                  <span>Request a Product</span>
                  <ArrowRight className="ml-1.5 sm:ml-2" size={13} strokeWidth={1.5} />
                </Button>
              </Link>
              <Link href="/tracking" className="w-auto sm:w-auto">
                <Button
                  size="sm"
                  variant="default"
                  className="px-4 sm:px-6 py-2 sm:py-3.5 !bg-blue-600 hover:!bg-blue-700 !text-white font-semibold !shadow-lg !shadow-blue-800/40 hover:!shadow-xl hover:!shadow-blue-800/50 transition-all duration-300 ease-out hover:-translate-y-0.5 rounded-lg sm:rounded-xl !opacity-100 !border-0 text-xs sm:text-sm"
                >
                  <Search className="mr-1.5 sm:mr-2" size={14} strokeWidth={1.5} />
                  <span>Track Shipment</span>
                </Button>
              </Link>
              <Link href="/wholesale-products" className="w-auto sm:w-auto">
                <Button
                  size="sm"
                  variant="default"
                  className="px-4 sm:px-6 py-2 sm:py-3.5 !bg-emerald-600 hover:!bg-emerald-700 !text-white font-semibold !shadow-lg !shadow-emerald-800/40 hover:!shadow-xl hover:!shadow-emerald-800/50 transition-all duration-300 ease-out hover:-translate-y-0.5 rounded-lg sm:rounded-xl !opacity-100 !border-0 text-xs sm:text-sm"
                >
                  <Package className="mr-1.5 sm:mr-2" size={14} strokeWidth={1.5} />
                  <span>Wholesale Products</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-full text-slate-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,0 600,120 900,60 C1050,30 1150,90 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Service Cards Section - each with unique color */}
      <section className="py-10 md:py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Explore Our Services</h2>
              <p className="text-slate-600 text-sm md:text-base flex items-center justify-center gap-2">
                <span>Click any service below to get started</span>
                <ArrowRight className="w-4 h-4" />
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
              {heroServices.map((service, index) => (
                <Link key={index} href={`/services/${service.slug}`} className="block">
                  <div className={`group h-full bg-white rounded-2xl p-4 md:p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.15)] border-2 border-transparent ${service.hoverBorder} transition-all duration-300 cursor-pointer text-center hover:-translate-y-2 flex flex-col items-center justify-center min-h-[120px] md:min-h-[140px] relative`}>
                    <div className={`w-12 h-12 md:w-14 md:h-14 ${service.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md`}>
                      <service.icon className="text-white" size={24} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-slate-900 font-bold text-xs md:text-sm leading-tight whitespace-nowrap mb-1">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 text-[10px] md:text-xs leading-tight">
                      {service.description}
                    </p>
                    <div className={`mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                      <ArrowRight className={`w-4 h-4 ${service.hoverArrow} mx-auto`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Services
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for all your China-Bangladesh trade needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
            {services.map((service, index) => (
              <Card key={index} className="card-hover group border-0 shadow-sm hover:shadow-xl">
                <CardContent className="p-4 sm:p-6">
                  <div className={`w-14 h-14 ${service.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <service.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-slate-700 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8 md:mt-10">
            <Link href="/services">
              <Button size="lg" className="px-8 bg-slate-800 hover:bg-slate-900 shadow-lg shadow-slate-800/20 hover:shadow-xl hover:shadow-slate-800/30">
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Explore Videos
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
                    className="card-hover overflow-hidden cursor-pointer group border-0 shadow-sm"
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
                          <Play className="text-slate-800 ml-1" size={24} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-slate-900">{video.title}</h3>
                      {video.description && (
                        <p className="text-gray-600 text-sm">{video.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-6 sm:mt-8 md:mt-10">
                <Link href="/videos">
                  <Button size="lg" variant="outline" className="px-8 border-2 border-slate-300 text-slate-700 hover:bg-slate-50">
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedVideo.title}</h3>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Shipping Methods
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the shipping method that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {shippingMethods.map((method, index) => (
              <Card
                key={index}
                className="card-hover text-center overflow-hidden group border-0 shadow-sm"
              >
                <CardContent className="p-5 sm:p-8 relative">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    <method.icon className="text-white" size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{method.title}</h3>
                  <p className={`text-3xl font-bold ${method.timeColor} mb-2`}>
                    {method.time}
                  </p>
                  <p className="text-gray-600">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                Why Choose <span className="text-white">HELP & BENEFIT TRADE LTD</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/70 mb-4 sm:mb-6 md:mb-8">
                With years of experience in China-Bangladesh trade, we provide
                reliable, efficient, and cost-effective solutions for your
                business.
              </p>
              <ul className="space-y-3 sm:space-y-4">
                {whyChooseUs.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <CheckCircle
                      className="text-emerald-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform"
                      size={20}
                    />
                    <span className="text-white/85 group-hover:text-white transition-colors">
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
                  className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10"
                >
                  <stat.icon
                    className="mx-auto mb-2 text-white/80"
                    size={28}
                  />
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 rounded-3xl p-5 sm:p-8 md:p-12 text-center relative overflow-hidden border border-slate-200/50">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ready to Start Your Import Journey?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Let us help you source the best products from China and deliver
                them to your doorstep in Bangladesh.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/product-request">
                  <Button size="lg" className="px-8 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30 text-white rounded-xl">
                    <Zap className="mr-2" size={20} />
                    Submit Product Request
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="px-8 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-xl">
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
