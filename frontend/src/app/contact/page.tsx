'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { Phone, Mail, MapPin, Facebook, MessageCircle, Send, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/contact', data);
      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-3 sm:py-6 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100">
              Have questions? We&apos;re here to help. Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-4 sm:py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-4 sm:mb-6">Get in Touch</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-gray-600">+880 1835220729 (Admin: RONY)</p>
                      <p className="text-gray-600">+86 13071095097 (WeChat)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-gray-600">helpandbenefit30@gmail.com</p>
                      <p className="text-gray-600">support@hbtrade.com</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Office Addresses</h3>
                      <p className="text-gray-600 mb-2">
                        <strong>China Office:</strong><br />
                        Tahei Town, Baiyun District<br />
                        Guangzhou City, China<br />
                        广州市白云区太和镇
                      </p>
                      <p className="text-gray-600">
                        <strong>Bangladesh Office:</strong><br />
                        Dhaka, Uttara, Sector 5<br />
                        Road 3, House # 25<br />
                        ঢাকা, উত্তরা, সেক্টর ৫
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social Links */}
              <div className="mt-6 sm:mt-8">
                <h3 className="font-semibold mb-4">Connect With Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://wa.me/8801835220729"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                  >
                    <MessageCircle size={20} />
                    WhatsApp
                  </a>
                  <a
                    href="https://facebook.com/hbtradebd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Facebook size={20} />
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              {isSuccess ? (
                <Card className="text-center">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <CheckCircle className="text-green-500" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Message Sent!</h2>
                    <p className="text-gray-600 mb-4 sm:mb-6">
                      Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                    </p>
                    <Button onClick={() => setIsSuccess(false)}>
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-2xl font-bold mb-4 sm:mb-6">Send Us a Message</h2>
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Name *
                          </label>
                          <Input
                            {...register('name', { required: 'Name is required' })}
                            placeholder="Enter your name"
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            placeholder="your@email.com"
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <Input
                          {...register('subject')}
                          placeholder="What is this about?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <Textarea
                          {...register('message', { required: 'Message is required' })}
                          placeholder="How can we help you?"
                          rows={5}
                          className={errors.message ? 'border-red-500' : ''}
                        />
                        {errors.message && (
                          <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={20} />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2" size={20} />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Our Locations</h2>
            <p className="text-gray-600">Visit us at our offices in China and Bangladesh</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <Card>
              <CardContent className="p-0">
                <div className="bg-gray-200 h-40 sm:h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-600">Guangzhou, China</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">China Office</h3>
                  <p className="text-gray-600 text-sm">Guangzhou, China</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="bg-gray-200 h-40 sm:h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-600">Dhaka, Bangladesh</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">Bangladesh Office</h3>
                  <p className="text-gray-600 text-sm">Uttara Sector 05, Road 03, House 25, Dhaka</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
