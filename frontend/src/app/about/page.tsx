import { Card, CardContent } from '@/components/ui/Card';
import { Target, Eye, Award, Users, Globe, Shield } from 'lucide-react';

export const metadata = {
  title: 'About Us - H&B Trade',
  description: 'Learn about H&B Trade - Your trusted partner for China to Bangladesh product sourcing and logistics services.',
};

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Reliability',
      description: 'We build long-term relationships based on trust and transparent communication.',
    },
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We ensure the highest quality standards in every product we source.',
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'Your success is our priority. We go above and beyond to meet your needs.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Strong partnerships with suppliers and logistics providers worldwide.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About H&B Trade
            </h1>
            <p className="text-xl text-blue-100">
              Your trusted bridge between China and Bangladesh for quality products and reliable logistics services.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  H&B Trade was founded with a simple mission: to make international trade between China and Bangladesh accessible, efficient, and profitable for businesses of all sizes.
                </p>
                <p>
                  Starting as a small trading company, we have grown into a comprehensive sourcing and logistics partner, serving hundreds of businesses across Bangladesh. Our deep understanding of both Chinese manufacturing and Bangladeshi market needs allows us to bridge the gap effectively.
                </p>
                <p>
                  Today, we are proud to offer a complete suite of services including product sourcing, wholesale supply, air cargo, sea shipping, hand carry services, and Canton Fair support. Our team of experienced professionals works tirelessly to ensure your products reach you safely, on time, and at the best possible prices.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">5+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <div className="text-gray-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                  <div className="text-gray-600">Orders Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">50+</div>
                  <div className="text-gray-600">Supplier Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="text-primary" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                </div>
                <p className="text-gray-600 text-lg">
                  To empower businesses in Bangladesh by providing seamless access to quality products from China, offering reliable logistics solutions, and building lasting partnerships that drive mutual growth and success.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Eye className="text-secondary" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold">Our Vision</h3>
                </div>
                <p className="text-gray-600 text-lg">
                  To become the most trusted and preferred sourcing and logistics partner for China-Bangladesh trade, known for our reliability, transparency, and commitment to customer success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center card-hover">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="text-primary" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Comprehensive solutions for all your China-Bangladesh trade needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Product Sourcing</h3>
              <ul className="space-y-2 text-blue-100">
                <li>- Supplier verification</li>
                <li>- Quality inspection</li>
                <li>- Price negotiation</li>
                <li>- Sample arrangement</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Logistics Services</h3>
              <ul className="space-y-2 text-blue-100">
                <li>- Air cargo</li>
                <li>- Sea shipping</li>
                <li>- Hand carry service</li>
                <li>- Customs clearance</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Business Support</h3>
              <ul className="space-y-2 text-blue-100">
                <li>- Canton Fair assistance</li>
                <li>- Translation services</li>
                <li>- Market research</li>
                <li>- Trade consultation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals committed to your success
            </p>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-8">
              Our team consists of experienced sourcing specialists, logistics experts, and customer service professionals who understand the intricacies of China-Bangladesh trade. With offices in both Guangzhou, China and Dhaka, Bangladesh, we provide local expertise with global reach.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="text-gray-400" size={40} />
                </div>
                <h3 className="font-semibold text-lg">Sourcing Team</h3>
                <p className="text-gray-600">Product experts in China</p>
              </div>
              <div>
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Globe className="text-gray-400" size={40} />
                </div>
                <h3 className="font-semibold text-lg">Logistics Team</h3>
                <p className="text-gray-600">Shipping & customs experts</p>
              </div>
              <div>
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="text-gray-400" size={40} />
                </div>
                <h3 className="font-semibold text-lg">Support Team</h3>
                <p className="text-gray-600">24/7 customer assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
