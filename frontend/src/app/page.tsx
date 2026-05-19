"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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
          
          <div className="absolute top-1/4 left-10 w-3 h-3 bg-red-400 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-1/3 right-20 w-4 h-4 bg-green-400 rounded-full animate-float opacity-60" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-60" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-teal-300 rounded-full animate-float opacity-60" style={{ animationDelay: "1.5s" }}></div>
        </div>

        <div className="container mx-auto px-3 md:px-4 lg:px-6 relative z-10 pt-1 md:pt-0">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 md:px-5 py-2 md:py-2.5 mb-3 md:mb-6 border border-white/20 animate-bounce-in">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={14} />
              </div>
              <span className="text-xs md:text-sm font-semibold text-white/90">
                Trusted by 500+ Businesses Worldwide
              </span>
            </div>

            <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2 mb-3 md:mb-6 border border-green-400/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs md:text-sm font-semibold text-green-300">
                International Sourcing & Shipping Active
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-300 via-white to-green-300 bg-[length:200%_auto] animate-gradient-shift">
                HELP & BENEFIT TRADE
              </span>
              <span className="block mt-1 md:mt-2 text-base md:text-xl lg:text-2xl font-medium text-yellow-200/90">
                China-Bangladesh Trade Bridge
              </span>
            </h1>

            <p className="text-xs md:text-sm lg:text-base text-white/80 mb-3 md:mb-6 max-w-lg md:max-w-3xl mx-auto leading-relaxed hidden sm:block">
              Your trusted partner for <span className="text-white font-semibold">Product Sourcing</span>,{' '}
              <span className="text-white font-semibold">Wholesale Supply</span>, and{' '}
              <span className="text-white font-semibold">Fast Shipping</span> from China to Bangladesh
            </p>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-white/10">
                <Plane className="text-teal-400" size={14} />
                <span className="text-xs font-medium">Air: 7-10 Days</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-white/10">
                <Ship className="text-orange-400" size={14} />
                <span className="text-xs font-medium">Sea: 35-40 Days</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-white/10">
                <Zap className="text-yellow-400" size={14} />
                <span className="text-xs font-medium">Hand Carry: 72 Hours</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 justify-center">
              <Link href="/product-request">
                <Button
                  size="sm"
                  className="w-full md:w-auto px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg shadow-red-500/30 border border-red-500/50 transition-all duration-300"
                >
                  <Zap className="mr-1 md:mr-2" size={18} />
                  <span className="text-xs md:text-sm">Request Product</span>
                  <ArrowRight className="ml-1 md:ml-2" size={18} />
                </Button>
              </Link>
              <div className="flex gap-2 md:gap-3 justify-center">
                <Link href="/tracking">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full md:w-auto px-4 md:px-6 py-3 md:py-4 bg-transparent backdrop-blur-sm text-white border border-green-400/60 hover:bg-green-500/20 hover:border-green-400 font-semibold transition-all duration-300"
                  >
                    <Ship className="mr-1 md:mr-2" size={18} />
                    <span className="text-xs md:text-sm">Track Shipment</span>
                  </Button>
                </Link>
                <Link href="/wholesale-products">
                  <Button
                    size="sm"
                    className="w-full md:w-auto px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-yellow-500/30 border border-yellow-400/50 transition-all duration-300"
                  >
                    <ShoppingCart className="mr-1 md:mr-2" size={18} />
                    <span className="text-xs md:text-sm">Wholesale</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 md:mt-6 flex justify-center items-center gap-3 md:gap-4 sm:gap-6 sm:gap-8">
              <div className="flex flex-col items-center group">
                <div className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-red-500/30 to-red-600/20 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-1.5 group-hover:scale-110 transition-transform duration-300 border border-red-400/20">
                  🇨🇳
                </div>
                <span className="text-[10px] sm:text-xs text-white/70">China</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-6 sm:w-8 md:w-12 h-0.5 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"></div>
                <ArrowRight className="text-yellow-400 rotate-180" size={16} />
                <ArrowRight className="text-yellow-400" size={16} />
                <div className="w-6 sm:w-8 md:w-12 h-0.5 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500"></div>
              </div>
              <div className="flex flex-col items-center group">
                <div className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-green-500/30 to-green-600/20 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-1.5 group-hover:scale-110 transition-transform duration-300 border border-green-400/20">
                  🇧🇩
                </div>
                <span className="text-[10px] sm:text-xs text-white/70">Bangladesh</span>
              </div>
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
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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