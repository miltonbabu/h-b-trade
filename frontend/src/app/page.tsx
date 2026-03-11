'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
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
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const services = [
    {
      icon: ShoppingCart,
      title: 'Product Sourcing',
      description: 'Find the best products from China at competitive prices. We handle everything from supplier verification to quality control.',
    },
    {
      icon: Package,
      title: 'Wholesale Supply',
      description: 'Bulk purchasing solutions for businesses. Get access to a wide range of products at wholesale prices.',
    },
    {
      icon: Plane,
      title: 'Air Cargo',
      description: 'Fast and reliable air freight services. Get your products delivered quickly from China to Bangladesh.',
    },
    {
      icon: Ship,
      title: 'Sea Shipping',
      description: 'Cost-effective sea freight for large shipments. We handle customs clearance and documentation.',
    },
    {
      icon: Users,
      title: 'Hand Carry Service',
      description: 'Urgent delivery via hand carry. Perfect for time-sensitive and high-value items.',
    },
    {
      icon: Globe,
      title: 'Canton Fair Support',
      description: 'Complete assistance for Canton Fair visits. Translation, negotiation, and logistics support.',
    },
  ];

  const shippingMethods = [
    {
      icon: Plane,
      title: 'Air Freight',
      time: '3-7 Days',
      description: 'Fast delivery for urgent shipments',
    },
    {
      icon: Ship,
      title: 'Sea Freight',
      time: '15-30 Days',
      description: 'Economical for bulk shipments',
    },
    {
      icon: Package,
      title: 'Hand Carry',
      time: '1-3 Days',
      description: 'Fastest for small packages',
    },
  ];

  const whyChooseUs = [
    'Experienced team with deep knowledge of China-Bangladesh trade',
    'Strong network of reliable suppliers and manufacturers',
    'Competitive pricing with transparent costs',
    'End-to-end tracking and customer support',
    'Quality assurance and inspection services',
    'Customs clearance and documentation support',
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Your Trusted Partner for
              <span className="text-yellow-300"> China to Bangladesh</span> Trade
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Product sourcing, wholesale supply, shipping, air cargo, and hand carry services - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/product-request">
                <Button size="lg" className="bg-secondary hover:bg-secondary-700 text-white px-8">
                  Request a Product
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/tracking">
                <Button size="lg" variant="outline" className="bg-white text-primary border-white hover:bg-gray-100 px-8">
                  Track Shipment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for all your China-Bangladesh trade needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/services">
              <Button size="lg" className="px-8">
                View All Services
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Shipping Methods */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shipping Methods
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the shipping method that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingMethods.map((method, index) => (
              <Card key={index} className="card-hover text-center">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <method.icon className="text-primary" size={36} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{method.title}</h3>
                  <p className="text-3xl font-bold text-primary mb-2">{method.time}</p>
                  <p className="text-gray-600">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose H&B Trade?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                With years of experience in China-Bangladesh trade, we provide reliable, efficient, and cost-effective solutions for your business.
              </p>
              <ul className="space-y-4">
                {whyChooseUs.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                    <span className="text-blue-50">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-blue-100">Happy Clients</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold mb-2">1000+</div>
                <div className="text-blue-100">Orders Delivered</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold mb-2">5+</div>
                <div className="text-blue-100">Years Experience</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gray-100 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Start Your Import Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Let us help you source the best products from China and deliver them to your doorstep in Bangladesh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/product-request">
                <Button size="lg" className="bg-secondary hover:bg-secondary-700 text-white px-8">
                  Submit Product Request
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
