import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  Package,
  Plane,
  Ship,
  Users,
  Globe,
  CheckCircle,
  ArrowRight,
  Search
} from 'lucide-react';

export const metadata = {
  title: 'Our Services - H&B Trade',
  description: 'Explore our comprehensive services including product sourcing, wholesale supply, air cargo, sea shipping, hand carry, and Canton Fair support.',
};

export default function ServicesPage() {
  const services = [
    {
      icon: ShoppingCart,
      title: 'Product Sourcing',
      slug: 'product-sourcing',
      description: 'Find the perfect products from China\'s vast manufacturing network. We handle everything from supplier identification to quality verification.',
      features: [
        'Supplier verification and vetting',
        'Price negotiation and comparison',
        'Quality inspection and testing',
        'Sample arrangement and review',
        'Factory visits and audits',
        'Product customization support',
      ],
      color: 'primary',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop',
    },
    {
      icon: Package,
      title: 'Wholesale Supply',
      slug: 'wholesale-supply',
      description: 'Access a wide range of products at wholesale prices. Perfect for retailers, distributors, and businesses looking to stock quality products.',
      features: [
        'Bulk purchasing discounts',
        'Wide product catalog',
        'Flexible order quantities',
        'Consistent quality assurance',
        'Regular stock updates',
        'Competitive pricing',
      ],
      color: 'secondary',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=500&fit=crop',
    },
    {
      icon: Plane,
      title: 'Air Cargo',
      slug: 'air-cargo',
      description: 'Fast and reliable air freight services for time-sensitive shipments. Get your products from China to Bangladesh in days, not weeks.',
      features: [
        '3-7 days delivery time',
        'Real-time tracking',
        'Door-to-door service',
        'Customs clearance included',
        'Insurance options',
        'Temperature-controlled options',
      ],
      color: 'primary',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=500&fit=crop',
    },
    {
      icon: Ship,
      title: 'Sea Shipping',
      slug: 'sea-shipping',
      description: 'Cost-effective sea freight solutions for large shipments. Ideal for bulk orders and heavy cargo with flexible delivery schedules.',
      features: [
        '15-30 days delivery time',
        'FCL and LCL options',
        'Competitive rates',
        'Port-to-port or door-to-door',
        'Documentation support',
        'Cargo insurance',
      ],
      color: 'secondary',
      image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=500&fit=crop',
    },
    {
      icon: Users,
      title: 'Hand Carry Service',
      slug: 'hand-carry',
      description: 'Fastest delivery option for urgent and high-value items. Your products are personally escorted from China to Bangladesh.',
      features: [
        '1-3 days delivery',
        'Maximum security',
        'Personal handling',
        'Ideal for samples',
        'High-value items',
        'Urgent deliveries',
      ],
      color: 'primary',
      image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&h=500&fit=crop',
    },
    {
      icon: Globe,
      title: 'Canton Fair Support',
      slug: 'canton-fair',
      description: 'Complete assistance for Canton Fair visits. We help you navigate the fair, negotiate with suppliers, and manage logistics.',
      features: [
        'Fair registration assistance',
        'Translation services',
        'Supplier meetings setup',
        'Negotiation support',
        'Logistics coordination',
        'Post-fair follow-up',
      ],
      color: 'secondary',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
    },
  ];

  const process = [
    {
      step: '01',
      title: 'Submit Request',
      description: 'Tell us about the products you need through our simple request form.',
    },
    {
      step: '02',
      title: 'We Source',
      description: 'Our team finds the best suppliers and negotiates prices on your behalf.',
    },
    {
      step: '03',
      title: 'Quality Check',
      description: 'We inspect products to ensure they meet your quality standards.',
    },
    {
      step: '04',
      title: 'Ship & Deliver',
      description: 'Your products are shipped and delivered to your doorstep.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl text-blue-100">
              Comprehensive solutions for all your China-Bangladesh trade needs. From sourcing to delivery, we&apos;ve got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 bg-${service.color}/10 rounded-lg flex items-center justify-center`}>
                      <service.icon className={`text-${service.color}`} size={32} />
                    </div>
                    <h2 className="text-3xl font-bold">{service.title}</h2>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link href={`/services/${service.slug}`}>
                      <Button
                        size="lg"
                        className={`group relative overflow-hidden rounded-xl px-8 py-6 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                          service.color === 'primary'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                        }`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Request This Service
                          <ArrowRight
                            className="transition-transform duration-300 group-hover:translate-x-1"
                            size={18}
                          />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <Card className="overflow-hidden">
                    <div className="relative h-64 w-full">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, transparent process from request to delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Submit your service request today and let us handle the rest. Our team is ready to help you with all your China-Bangladesh trade needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services/product-sourcing">
                <Button size="lg" className="bg-secondary hover:bg-secondary-700 text-white px-8">
                  Submit Service Request
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/services/track">
                <Button size="lg" variant="outline" className="bg-white text-primary border-white hover:bg-gray-100 px-8">
                  <Search className="mr-2" size={20} />
                  Track Service Request
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 px-8">
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
