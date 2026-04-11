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
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32 relative overflow-hidden" style={{ backgroundImage: "url('/hero-image.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        {/* Chinese and Bangladeshi pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          {/* Chinese cloud pattern */}
          <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="chinese-cloud" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M10,50 Q25,30 40,50 T70,50 T100,50" fill="none" stroke="white" strokeWidth="2"/>
                <path d="M5,65 Q20,45 35,65 T65,65 T95,65" fill="none" stroke="white" strokeWidth="2"/>
                <circle cx="50" cy="35" r="3" fill="white"/>
                <circle cx="30" cy="70" r="2" fill="white"/>
                <circle cx="70" cy="70" r="2" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#chinese-cloud)"/>
          </svg>
          {/* Bangladeshi geometric pattern */}
          <svg className="absolute bottom-0 right-0 w-1/2 h-1/2" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="bangladeshi-geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <polygon points="30,5 55,55 5,55" fill="none" stroke="white" strokeWidth="1"/>
                <polygon points="30,55 55,5 5,5" fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="30" cy="30" r="8" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bangladeshi-geo)"/>
          </svg>
        </div>

        {/* Decorative border elements - Chinese style */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-green-500 to-red-600"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-red-600 to-green-500"></div>

        {/* Corner decorations - Chinese lattice style */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-white/30"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-white/30"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-white/30"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-white/30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust badge with cultural styling */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/20 to-green-600/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 animate-bounce-in border border-white/20">
              <Sparkles className="text-yellow-300" size={20} />
              <span className="text-sm font-semibold">
                Trusted by 500+ businesses
              </span>
            </div>

            {/* Main heading with cultural emphasis */}
            <h1 className="text-4xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-200 via-white to-green-200">
                HELP & BENEFIT TRADE
              </span>
              <span className="block mt-2 text-2xl md:text-3xl font-medium text-yellow-200">
                China-Bangladesh Trade Bridge
              </span>
            </h1>

            <p
              className="text-xl md:text-2xl mb-10 text-white/90 animate-fade-in leading-relaxed"
              style={{ animationDelay: "0.2s" }}
            >
              Product Sourcing • Wholesale Supply
              <br className="hidden md:block"/>
              Air Shipping 7-10 Days • Sea Shipping 35-40 Days
              <br className="hidden md:block"/>
              Hand Carry 72 Hours
            </p>

            {/* CTA buttons with cultural styling */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Link href="/product-request">
                <Button
                  size="lg"
                  className="px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-2xl shadow-red-600/40 border-2 border-red-400/50"
                >
                  <Zap className="mr-2" size={24} />
                  Request Product
                  <ArrowRight className="ml-2" size={24} />
                </Button>
              </Link>
              <Link href="/tracking">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-sm text-white border-2 border-green-400/50 hover:bg-green-600/30 hover:border-green-400 font-semibold"
                >
                  Track Shipment
                </Button>
              </Link>
              <Link href="/wholesale-products">
                <Button
                  size="lg"
                  className="px-10 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-2xl shadow-yellow-500/40 border-2 border-yellow-300/50 animate-pulse"
                >
                  <ShoppingCart className="mr-2" size={24} />
                  Wholesale Products
                  <Sparkles className="ml-2" size={24} />
                </Button>
              </Link>
            </div>

            {/* Cultural motifs */}
            <div className="mt-12 flex justify-center items-center gap-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="text-center">
                <div className="text-3xl mb-1">🇨🇳</div>
                <div className="text-xs text-white/70">China</div>
              </div>
              <div className="text-2xl text-yellow-300">↔️</div>
              <div className="text-center">
                <div className="text-3xl mb-1">🇧🇩</div>
                <div className="text-xs text-white/70">Bangladesh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements with cultural colors */}
        <div
          className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full floating border-2 border-red-400/20"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-32 right-16 w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-full floating border-2 border-green-400/20"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-24 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 rounded-full floating border-2 border-yellow-400/20"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-32 right-1/3 w-12 h-12 bg-gradient-to-br from-red-400/20 to-green-400/20 rounded-full floating border-2 border-white/20"
          style={{ animationDelay: "1.5s" }}
        ></div>

        {/* Traditional Chinese lantern decoration */}
        <div className="absolute top-16 right-8 opacity-20 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="25" rx="15" ry="20" fill="#dc2626" />
            <rect x="18" y="45" width="4" height="5" fill="#dc2626" />
            <rect x="10" y="5" width="20" height="3" fill="#dc2626" />
            <path d="M20 10 L20 40" stroke="#fef08a" strokeWidth="1" />
          </svg>
        </div>

        {/* Bangladeshi water lily decoration */}
        <div className="absolute bottom-16 left-8 opacity-20 animate-fade-in" style={{ animationDelay: "1s" }}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="8" fill="#16a34a" />
            <ellipse cx="25" cy="15" rx="6" ry="10" fill="#16a34a" />
            <ellipse cx="35" cy="25" rx="6" ry="10" fill="#16a34a" transform="rotate(90 35 25)" />
            <ellipse cx="25" cy="35" rx="6" ry="10" fill="#16a34a" />
            <ellipse cx="15" cy="25" rx="6" ry="10" fill="#16a34a" transform="rotate(-90 15 25)" />
          </svg>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for all your China-Bangladesh trade needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {services.map((service, index) => (
              <Card key={index} className="card-hover group">
                <CardContent className="p-6">
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

          <div className="text-center mt-10">
            <Link href="/services">
              <Button size="lg" variant="gradient" className="px-8">
                View All Services
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Videos Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore <span className="gradient-text">Videos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

              <div className="text-center mt-10">
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

      {/* Video Modal */}
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

      {/* Shipping Methods */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shipping <span className="gradient-text">Methods</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the shipping method that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingMethods.map((method, index) => (
              <Card
                key={index}
                className="card-hover text-center overflow-hidden group"
              >
                <CardContent className="p-8 relative">
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

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary-700 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose <span className="text-yellow-300">HELP & BENEFIT TRADE LTD</span>?
              </h2>
              <p className="text-xl text-teal-100 mb-8">
                With years of experience in China-Bangladesh trade, we provide
                reliable, efficient, and cost-effective solutions for your
                business.
              </p>
              <ul className="space-y-4">
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
            <div className="grid grid-cols-2 gap-6">
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

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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
