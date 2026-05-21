'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Send, Upload, CheckCircle, Loader2, Package, Zap } from 'lucide-react';
import api from '@/lib/api';

interface ProductRequestForm {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  company: string;
  product_name: string;
  product_link: string;
  target_price: string;
  quantity: string;
  packaging_type: string;
  pack_quantity: string;
  master_pack_quantity: string;
  pack_dimensions: string;
  weight_per_pack: string;
  sample_needed: string;
  shipping_method: string;
  message: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function ProductRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductRequestForm>();

  const onSubmit = async (data: ProductRequestForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await api.post('/product-request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTrackingNumber(response.data.data.trackingNumber);
      setIsSuccess(true);
      reset();
      setSelectedFile(null);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto text-center border-0 shadow-2xl">
            <CardContent className="p-5 sm:p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-green-500/30">
                <CheckCircle className="text-white" size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-4 gradient-text">Request Submitted!</h2>
              <p className="text-gray-600 mb-4">
                Thank you for your product request. Our team will review it and get back to you within 24-48 hours.
              </p>
              <div className="bg-primary/10 rounded-xl p-4 mb-4 sm:mb-6">
                <p className="text-sm text-gray-600 mb-1">Your Tracking Number</p>
                <p className="text-2xl font-bold text-primary">{trackingNumber}</p>
                <p className="text-xs text-gray-500 mt-2">Save this number to track your request status</p>
              </div>
              <Button variant="gradient" onClick={() => setIsSuccess(false)}>
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-3 sm:py-8 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="hidden sm:inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6">
              <Package className="text-yellow-300" size={18} />
              <span className="text-sm font-medium">Product Sourcing Made Easy</span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
              Request a <span className="text-yellow-300">Product</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-teal-100">
              Tell us about the products you need and we&apos;ll source them from China for you.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-4 sm:py-8 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-lg sm:text-2xl gradient-text">Submit Your Product Request</CardTitle>
              <p className="text-gray-600">
                Fill out the form below with your product details. Our team will contact you within 24-48 hours.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 sm:mb-6 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Enter your full name"
                      className={`rounded-xl ${errors.name ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
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
                      className={`rounded-xl ${errors.email ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      {...register('phone')}
                      placeholder="+880 1XXX-XXXXXX"
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <Input
                      {...register('whatsapp')}
                      placeholder="+880 1XXX-XXXXXX"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <Input
                    {...register('company')}
                    placeholder="Your company name (optional)"
                    className="rounded-xl"
                  />
                </div>

                {/* Product Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 gradient-text">Product Details</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register('product_name', { required: 'Product name is required' })}
                        placeholder="What product are you looking for?"
                        className={`rounded-xl ${errors.product_name ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                      />
                      {errors.product_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.product_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Link / Reference
                      </label>
                      <Input
                        {...register('product_link')}
                        placeholder="Link to the product (e.g., Alibaba, 1688, Amazon)"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Price per Unit (USD)
                        </label>
                        <Input
                          {...register('target_price')}
                          placeholder="e.g., $2.50 per piece"
                          className="rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order Quantity <span className="text-red-500">*</span>
                        </label>
                        <Input
                          {...register('quantity', { required: 'Quantity is required' })}
                          placeholder="e.g., 100 pieces, 50 cartons"
                          className={`rounded-xl ${errors.quantity ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                        />
                        {errors.quantity && (
                          <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Packaging Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('packaging_type', { required: 'Packaging type is required' })}
                          className={`w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.packaging_type ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                        >
                          <option value="">Select packaging type</option>
                          <option value="carton">Carton / Box</option>
                          <option value="bag">Bag / Sack</option>
                          <option value="pallet">Pallet</option>
                          <option value="roll">Roll</option>
                          <option value="bundle">Bundle</option>
                          <option value="crate">Wooden Crate</option>
                          <option value="drum">Drum / Barrel</option>
                          <option value="case">Case</option>
                          <option value="other">Other (specify in message)</option>
                        </select>
                        {errors.packaging_type && (
                          <p className="text-red-500 text-sm mt-1">{errors.packaging_type.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity per Pack / Inner Unit
                        </label>
                        <Input
                          {...register('pack_quantity')}
                          placeholder="e.g., 20 pieces per inner pack"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity per Master Pack / Outer Unit
                        </label>
                        <Input
                          {...register('master_pack_quantity')}
                          placeholder="e.g., 10 inner packs per master pack"
                          className="rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Master Pack Dimensions (L x W x H cm)
                        </label>
                        <Input
                          {...register('pack_dimensions')}
                          placeholder="e.g., 60 x 40 x 35 cm"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight per Master Pack (kg)
                      </label>
                      <Input
                        {...register('weight_per_pack')}
                        placeholder="e.g., 12 kg"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample Needed?
                        </label>
                        <select
                          {...register('sample_needed')}
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes - Send sample first</option>
                          <option value="no">No - Direct production</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Shipping Method
                        </label>
                        <select
                          {...register('shipping_method')}
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">Select shipping method</option>
                          <option value="air-cargo">Air Cargo (3-7 days)</option>
                          <option value="sea-shipping">Sea Shipping (15-30 days)</option>
                          <option value="hand-carry">Hand Carry (1-3 days)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Specifications & Requirements
                      </label>
                      <Textarea
                        {...register('message')}
                        placeholder="Tell us more about your requirements (size, color, material, packaging, logo/labeling, certifications needed like CE, FDA, etc.)"
                        rows={4}
                        className="rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="mx-auto text-primary mb-2" size={32} />
                          <p className="text-gray-600 font-medium">
                            {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="gradient"
                  className="w-full rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2" size={20} />
                      <Send className="mr-2" size={20} />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
