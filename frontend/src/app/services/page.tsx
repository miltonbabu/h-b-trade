import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Package, 
  Plane, 
  Ship, 
  Users, 
  Globe,
  CheckCircle,
  ArrowRight
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
    },
    {
      icon: Package,
      title: 'Wholesale Supply',
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
    },
    {
      icon: Plane,
      title: 'Air Cargo',
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
    },
    {
      icon: Ship,
      title: 'Sea Shipping',
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
    },
    {
      icon: Users,
      title: 'Hand Carry Service',
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
    },
    {
      icon: Globe,
      title: 'Canton Fair Support',
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
                </div>
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <Card className="overflow-hidden">
                    <div className={`h-64 bg-gradient-to-br ${
                      service.color === 'primary' 
                        ? 'from-blue-500 to-blue-700' 
                        : 'from-red-500 to-red-700'
                    } flex items-center justify-center`}>
                      <service.icon className="text-white opacity-20" size={150} />
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
              Submit your product request today and let us handle the rest. Our team is ready to help you source the best products from China.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/product-request">
                <Button size="lg" className="bg-secondary hover:bg-secondary-700 text-white px-8">
                  Submit Product Request
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-white text-primary border-white hover:bg-gray-100 px-8">
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
