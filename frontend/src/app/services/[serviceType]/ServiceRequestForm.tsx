'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Send, CheckCircle, Loader2, ShoppingCart, Package, Plane, Ship, Users, Globe, ArrowLeft, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface ServiceFormCommon {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  company: string;
  message: string;
}

interface ServiceForm extends ServiceFormCommon {
  [key: string]: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const SERVICE_CONFIG: Record<string, {
  title: string;
  serviceType: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  description: string;
  specificFields: { key: string; label: string; type?: string; placeholder: string; required?: boolean; options?: { value: string; label: string }[] }[];
}> = {
  'product-sourcing': {
    title: 'Product Sourcing',
    serviceType: 'product_sourcing',
    icon: ShoppingCart,
    color: 'from-blue-500 to-blue-700',
    description: 'Tell us about the products you need and we\'ll source them from China\'s vast manufacturing network.',
    specificFields: [
      { key: 'product_name', label: 'Product Name', placeholder: 'What product are you looking for?', required: true },
      { key: 'product_link', label: 'Product Link / Reference', placeholder: 'Link to the product (e.g., Alibaba, 1688, Amazon)' },
      { key: 'target_price', label: 'Target Price per Unit (USD)', placeholder: 'e.g., $2.50 per piece' },
      { key: 'quantity', label: 'Order Quantity', placeholder: 'e.g., 100 pieces, 50 cartons', required: true },
      { key: 'packaging_type', label: 'Packaging Type', placeholder: 'Select packaging type', required: true, options: [
        { value: '', label: 'Select packaging type' },
        { value: 'carton', label: 'Carton / Box' },
        { value: 'bag', label: 'Bag / Sack' },
        { value: 'pallet', label: 'Pallet' },
        { value: 'roll', label: 'Roll' },
        { value: 'bundle', label: 'Bundle' },
        { value: 'crate', label: 'Wooden Crate' },
        { value: 'drum', label: 'Drum / Barrel' },
        { value: 'case', label: 'Case' },
        { value: 'other', label: 'Other (specify below)' },
      ] },
      { key: 'pack_quantity', label: 'Quantity per Pack / Inner Unit', placeholder: 'e.g., 20 pieces per inner pack' },
      { key: 'master_pack_quantity', label: 'Quantity per Master Pack / Outer Unit', placeholder: 'e.g., 10 inner packs per master pack' },
      { key: 'pack_dimensions', label: 'Master Pack Dimensions (L x W x H cm)', placeholder: 'e.g., 60 x 40 x 35 cm' },
      { key: 'weight_per_pack', label: 'Weight per Master Pack (kg)', placeholder: 'e.g., 12 kg' },
      { key: 'specifications', label: 'Product Specifications', type: 'textarea', placeholder: 'Size, color, material, packaging requirements, logo/labeling, certifications needed (CE, FDA, etc.)' },
      { key: 'sample_needed', label: 'Sample Needed?', placeholder: 'Select', options: [
        { value: '', label: 'Select' },
        { value: 'yes', label: 'Yes - Send sample first' },
        { value: 'no', label: 'No - Direct production' },
      ] },
    ],
  },
  'wholesale-supply': {
    title: 'Wholesale Supply',
    serviceType: 'wholesale_supply',
    icon: Package,
    color: 'from-red-500 to-red-700',
    description: 'Access a wide range of products at wholesale prices for your business.',
    specificFields: [
      { key: 'product_category', label: 'Product Category', placeholder: 'e.g., Electronics, Clothing, Home & Garden', required: true },
      { key: 'product_names', label: 'Specific Products Needed', placeholder: 'List the products you want to buy' },
      { key: 'quantity', label: 'Total Order Quantity', placeholder: 'e.g., 500-1000 units', required: true },
      { key: 'packaging_type', label: 'Packaging Type', placeholder: 'Select packaging type', required: true, options: [
        { value: '', label: 'Select packaging type' },
        { value: 'carton', label: 'Carton / Box' },
        { value: 'bag', label: 'Bag / Sack' },
        { value: 'pallet', label: 'Pallet' },
        { value: 'roll', label: 'Roll' },
        { value: 'bundle', label: 'Bundle' },
        { value: 'crate', label: 'Wooden Crate' },
        { value: 'drum', label: 'Drum / Barrel' },
        { value: 'case', label: 'Case' },
        { value: 'other', label: 'Other (specify below)' },
      ] },
      { key: 'pack_quantity', label: 'Quantity per Pack / Inner Unit', placeholder: 'e.g., 20 pieces per pack' },
      { key: 'master_pack_quantity', label: 'Quantity per Master Pack / Outer Unit', placeholder: 'e.g., 10 packs per master pack' },
      { key: 'pack_dimensions', label: 'Master Pack Dimensions (L x W x H cm)', placeholder: 'e.g., 60 x 40 x 35 cm' },
      { key: 'weight_per_pack', label: 'Weight per Master Pack (kg)', placeholder: 'e.g., 15 kg' },
      { key: 'target_price', label: 'Target Price per Unit (USD)', placeholder: 'e.g., $1.50 - $3.00' },
      { key: 'budget_range', label: 'Total Budget Range (USD)', placeholder: 'e.g., $1,000 - $5,000' },
      { key: 'specifications', label: 'Quality & Packaging Requirements', type: 'textarea', placeholder: 'Product details, quality standards, packaging requirements, labeling, certifications needed' },
    ],
  },
  'air-cargo': {
    title: 'Air Cargo',
    serviceType: 'air_cargo',
    icon: Plane,
    color: 'from-blue-500 to-blue-700',
    description: 'Fast and reliable air freight services. Get your products from China to Bangladesh in 3-7 days.',
    specificFields: [
      { key: 'cargo_description', label: 'Cargo Description', placeholder: 'What items need to be shipped?', required: true },
      { key: 'packaging_type', label: 'Packaging Type', placeholder: 'Select packaging type', required: true, options: [
        { value: '', label: 'Select packaging type' },
        { value: 'carton', label: 'Carton / Box' },
        { value: 'bag', label: 'Bag / Sack' },
        { value: 'pallet', label: 'Pallet' },
        { value: 'crate', label: 'Wooden Crate' },
        { value: 'drum', label: 'Drum / Barrel' },
        { value: 'case', label: 'Case' },
        { value: 'other', label: 'Other (specify below)' },
      ] },
      { key: 'total_packs', label: 'Total Number of Packs', placeholder: 'e.g., 10 packs', required: true },
      { key: 'weight_per_pack', label: 'Weight per Pack', placeholder: 'e.g., 5 kg per pack' },
      { key: 'total_weight', label: 'Total Actual Weight', placeholder: 'e.g., 50 kg' },
      { key: 'pack_dimensions', label: 'Pack Dimensions (L x W x H cm)', placeholder: 'e.g., 60 x 40 x 30 cm per pack' },
      { key: 'volume_weight', label: 'Volume Weight (kg)', placeholder: 'Calculated: (L x W x H x packs) / 5000' },
      { key: 'cargo_value', label: 'Total Cargo Value (USD)', placeholder: 'e.g., $2,500' },
      { key: 'hs_code', label: 'HS Code (if known)', placeholder: 'e.g., 8517.12' },
      { key: 'origin_airport', label: 'Origin Airport', placeholder: 'e.g., Guangzhou Baiyun (CAN)' },
      { key: 'destination_airport', label: 'Destination Airport', placeholder: 'e.g., Dhaka Hazrat Shahjalal (DAC)' },
      { key: 'preferred_date', label: 'Preferred Shipping Date', type: 'date', placeholder: '' },
    ],
  },
  'sea-shipping': {
    title: 'Sea Shipping',
    serviceType: 'sea_shipping',
    icon: Ship,
    color: 'from-red-500 to-red-700',
    description: 'Cost-effective sea freight solutions for large shipments. 15-30 days delivery.',
    specificFields: [
      { key: 'cargo_description', label: 'Cargo Description', placeholder: 'What items need to be shipped?', required: true },
      { key: 'cargo_type', label: 'Cargo Type', placeholder: 'e.g., General cargo, Hazardous, Perishable', required: true },
      { key: 'container_type', label: 'Container Type', placeholder: 'Select container type', options: [
        { value: '', label: 'Select container type' },
        { value: 'FCL-20ft', label: 'FCL - 20ft Container' },
        { value: 'FCL-40ft', label: 'FCL - 40ft Container' },
        { value: 'FCL-40ft-HC', label: 'FCL - 40ft High Cube' },
        { value: 'LCL', label: 'LCL (Less than Container Load)' },
      ] },
      { key: 'packaging_type', label: 'Packaging Type', placeholder: 'Select packaging type', required: true, options: [
        { value: '', label: 'Select packaging type' },
        { value: 'carton', label: 'Carton / Box' },
        { value: 'bag', label: 'Bag / Sack' },
        { value: 'pallet', label: 'Pallet' },
        { value: 'crate', label: 'Wooden Crate' },
        { value: 'drum', label: 'Drum / Barrel' },
        { value: 'case', label: 'Case' },
        { value: 'other', label: 'Other (specify below)' },
      ] },
      { key: 'total_packs', label: 'Total Number of Packs', placeholder: 'e.g., 50 cartons, 10 pallets' },
      { key: 'weight_per_pack', label: 'Weight per Pack', placeholder: 'e.g., 20 kg per pack' },
      { key: 'total_weight', label: 'Total Gross Weight (kg)', placeholder: 'e.g., 5000 kg' },
      { key: 'pack_dimensions', label: 'Pack Dimensions (L x W x H cm)', placeholder: 'e.g., 80 x 60 x 50 cm per pack' },
      { key: 'total_volume', label: 'Total Volume (CBM)', placeholder: 'e.g., 15 CBM' },
      { key: 'cargo_value', label: 'Total Cargo Value (USD)', placeholder: 'e.g., $15,000' },
      { key: 'hs_code', label: 'HS Code (if known)', placeholder: 'e.g., 9403.60' },
      { key: 'origin_port', label: 'Origin Port', placeholder: 'e.g., Guangzhou, Shenzhen, Shanghai' },
      { key: 'destination_port', label: 'Destination Port', placeholder: 'e.g., Chittagong (Chattogram)' },
      { key: 'incoterm', label: 'Incoterm', placeholder: 'Select incoterm', options: [
        { value: '', label: 'Select incoterm' },
        { value: 'EXW', label: 'EXW - Ex Works' },
        { value: 'FOB', label: 'FOB - Free On Board' },
        { value: 'CIF', label: 'CIF - Cost Insurance Freight' },
        { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
      ] },
    ],
  },
  'hand-carry': {
    title: 'Hand Carry Service',
    serviceType: 'hand_carry',
    icon: Users,
    color: 'from-blue-500 to-blue-700',
    description: 'Fastest delivery option for urgent and high-value items. 1-3 days delivery with personal escort.',
    specificFields: [
      { key: 'item_description', label: 'Item Description', placeholder: 'What items need to be hand-carried?', required: true },
      { key: 'number_of_items', label: 'Number of Items', placeholder: 'e.g., 3 items' },
      { key: 'total_weight', label: 'Total Weight (kg)', placeholder: 'e.g., 8 kg' },
      { key: 'box_dimensions', label: 'Package Dimensions (L x W x H cm)', placeholder: 'e.g., 40 x 30 x 20 cm' },
      { key: 'declared_value', label: 'Declared Value (USD)', placeholder: 'e.g., $5,000' },
      { key: 'urgency', label: 'Urgency Level', placeholder: 'Select urgency', options: [
        { value: '', label: 'Select urgency level' },
        { value: 'urgent', label: 'Urgent (1-2 days)' },
        { value: 'express', label: 'Express (2-3 days)' },
        { value: 'standard', label: 'Standard (3-5 days)' },
      ] },
      { key: 'pickup_location', label: 'Pickup Location', placeholder: 'e.g., Guangzhou hotel, factory address' },
      { key: 'delivery_location', label: 'Delivery Location', placeholder: 'e.g., Dhaka office address' },
    ],
  },
  'canton-fair': {
    title: 'Canton Fair Support',
    serviceType: 'canton_fair',
    icon: Globe,
    color: 'from-red-500 to-red-700',
    description: 'Complete assistance for Canton Fair visits including translation, negotiation, and logistics.',
    specificFields: [
      { key: 'fair_name', label: 'Which Fair / Phase', placeholder: 'Select fair', options: [
        { value: '', label: 'Select fair' },
        { value: 'canton_phase1', label: 'Canton Fair Phase 1 (Electronics, Machinery)' },
        { value: 'canton_phase2', label: 'Canton Fair Phase 2 (Home, Decor, Gifts)' },
        { value: 'canton_phase3', label: 'Canton Fair Phase 3 (Textiles, Shoes, Food)' },
        { value: 'other', label: 'Other Fair in China' },
      ] },
      { key: 'visit_date', label: 'Planned Visit Date', type: 'date', placeholder: '', required: true },
      { key: 'visit_duration', label: 'Visit Duration (days)', placeholder: 'e.g., 3 days' },
      { key: 'number_of_attendees', label: 'Number of Attendees', placeholder: 'e.g., 2' },
      { key: 'assistance_type', label: 'Type of Assistance', placeholder: 'Select assistance type', options: [
        { value: '', label: 'Select assistance type' },
        { value: 'full_package', label: 'Full Package (Registration + Translation + Negotiation + Logistics)' },
        { value: 'translation_only', label: 'Translation & Interpretation Only' },
        { value: 'negotiation_support', label: 'Supplier Negotiation Support' },
        { value: 'logistics_only', label: 'Hotel & Transport Logistics Only' },
      ] },
      { key: 'language_preference', label: 'Language Preference', placeholder: 'e.g., English, Bengali, Hindi' },
      { key: 'product_interest', label: 'Products of Interest', placeholder: 'e.g., Electronics, Home Decor, Textiles' },
      { key: 'target_suppliers', label: 'Target Number of Suppliers to Meet', placeholder: 'e.g., 10-15 suppliers' },
      { key: 'hotel_preference', label: 'Hotel Preference', placeholder: 'e.g., Near Pazhou Complex, 4-star' },
      { key: 'pickup_needed', label: 'Airport Pickup Needed?', placeholder: 'Select', options: [
        { value: '', label: 'Select' },
        { value: 'yes', label: 'Yes - Need airport pickup' },
        { value: 'no', label: 'No - Will arrange own transport' },
      ] },
    ],
  },
};

export default function ServiceRequestForm({ serviceType }: { serviceType: string }) {
  const config = SERVICE_CONFIG[serviceType];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [copiedWarehouse, setCopiedWarehouse] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ServiceForm>();

  const WAREHOUSE_ADDRESSES: Record<string, { name: string; address: string; contact?: string }> = {
    'guangzhou_baiyun': {
      name: 'Guangzhou Baiyun Warehouse',
      address: 'Room 1205, Building B, Baiyun Wanda Plaza, 583 Yuncheng West Road, Baiyun District, Guangzhou, China 510405',
      contact: 'WeChat: HBTrade_GZ | Phone: +86 138-0000-1234',
    },
    'guangzhou_pazhou': {
      name: 'Guangzhou Pazhou Warehouse',
      address: 'Room 803, Tower A, Poly World Trade Center, 680 Yuejiang West Road, Haizhu District, Guangzhou, China 510308',
      contact: 'WeChat: HBTrade_PZ | Phone: +86 138-0000-5678',
    },
    'yiwu': {
      name: 'Yiwu Warehouse',
      address: 'Room 506, Building 3, International Trade City District 4, Chouzhou North Road, Yiwu, Zhejiang, China 322000',
      contact: 'WeChat: HBTrade_YW | Phone: +86 139-0000-9012',
    },
    'shenzhen': {
      name: 'Shenzhen Warehouse',
      address: 'Room 1502, Building A, Huaqiang North SEG Plaza, Huaqiang North Road, Futian District, Shenzhen, China 518031',
      contact: 'WeChat: HBTrade_SZ | Phone: +86 755-8300-0000',
    },
    'dhaka': {
      name: 'Dhaka Office',
      address: 'Suite 402, 4th Floor, Multiplan Center, 69-71 New Elephant Road, Dhaka 1205, Bangladesh',
      contact: 'WhatsApp: +880 1700-000000 | Phone: +880 2-0000000',
    },
  };

  const selectedWarehouse = watch('delivery_warehouse');
  const warehouseInfo = selectedWarehouse ? WAREHOUSE_ADDRESSES[selectedWarehouse] : null;

  const copyWarehouseAddress = () => {
    if (warehouseInfo) {
      const fullAddress = `${warehouseInfo.name}\n${warehouseInfo.address}\n${warehouseInfo.contact || ''}`;
      navigator.clipboard.writeText(fullAddress.trim());
      setCopiedWarehouse(true);
      setTimeout(() => setCopiedWarehouse(false), 2000);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-6">The service you are looking for does not exist.</p>
          <Link href="/services">
            <Button>View All Services</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const Icon = config.icon;

  const onSubmit = async (data: ServiceForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const { name, phone, whatsapp, email, company, message, ...specificData } = data;
      const details: Record<string, string> = {};
      for (const [key, value] of Object.entries(specificData)) {
        if (value) details[key] = value;
      }

      const response = await api.post('/service-request', {
        service_type: config.serviceType,
        name,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        email,
        company: company || undefined,
        details: Object.keys(details).length > 0 ? details : undefined,
        message: message || undefined,
      });

      setTrackingNumber(response.data.data.trackingNumber);
      setIsSuccess(true);
      reset();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                Thank you for your {config.title.toLowerCase()} request. Our team will review it and get back to you within 24-48 hours.
              </p>
              <div className="bg-primary/10 rounded-xl p-4 mb-4 sm:mb-6">
                <p className="text-sm text-gray-600 mb-1">Your Tracking Number</p>
                <p className="text-2xl font-bold text-primary">{trackingNumber}</p>
                <p className="text-xs text-gray-500 mt-2">Save this number to track your request status</p>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/services/track">
                  <Button variant="gradient" className="w-full">Track Your Request</Button>
                </Link>
                <Button variant="outline" onClick={() => setIsSuccess(false)}>Submit Another Request</Button>
              </div>
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
            <Link href="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
              <ArrowLeft size={16} />
              Back to Services
            </Link>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6">
              <Icon className="text-yellow-300" size={18} />
              <span className="text-sm font-medium">{config.title}</span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
              Request <span className="text-yellow-300">{config.title}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-teal-100">
              {config.description}
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-4 sm:py-8 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-lg sm:text-2xl gradient-text">Submit Your {config.title} Request</CardTitle>
              <p className="text-gray-600">
                Fill out the form below and our team will contact you within 24-48 hours.
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
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                      })}
                      placeholder="your@email.com"
                      className={`rounded-xl ${errors.email ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input {...register('phone')} placeholder="+880 1XXX-XXXXXX" className="rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <Input {...register('whatsapp')} placeholder="+880 1XXX-XXXXXX" className="rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <Input {...register('company')} placeholder="Your company name (optional)" className="rounded-xl" />
                </div>

                {/* Service-Specific Fields */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 gradient-text">{config.title} Details</h3>
                  <div className="space-y-6">
                    {config.specificFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            {...register(field.key, field.required ? { required: `${field.label} is required` } : undefined)}
                            placeholder={field.placeholder}
                            rows={3}
                            className={`rounded-xl ${errors[field.key] ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                          />
                        ) : field.options ? (
                          <select
                            {...register(field.key, field.required ? { required: `${field.label} is required` } : undefined)}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={field.type || 'text'}
                            {...register(field.key, field.required ? { required: `${field.label} is required` } : undefined)}
                            placeholder={field.placeholder}
                            className={`rounded-xl ${errors[field.key] ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                          />
                        )}
                        {errors[field.key] && <p className="text-red-500 text-sm mt-1">{errors[field.key]?.message}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message</label>
                  <Textarea
                    {...register('message')}
                    placeholder="Any additional information or special requirements"
                    rows={4}
                    className="rounded-xl"
                  />
                </div>

                {/* Sender & Warehouse Section */}
                {serviceType !== 'product-sourcing' && serviceType !== 'wholesale-supply' && serviceType !== 'canton-fair' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 gradient-text">Sender & Warehouse Details</h3>
                  <p className="text-sm text-gray-500 mb-4">Help our warehouse identify and receive your shipment</p>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sender Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          {...register('sender_name', { required: 'Sender name is required' })}
                          placeholder="Name of person sending the goods"
                          className={`rounded-xl ${errors.sender_name ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                        />
                        {errors.sender_name && <p className="text-red-500 text-sm mt-1">{errors.sender_name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sender Phone
                        </label>
                        <Input
                          {...register('sender_phone')}
                          placeholder="Sender contact number"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sender Address / Pickup Location <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register('sender_address', { required: 'Sender address is required' })}
                        placeholder="Full address where goods will be picked up (e.g., Factory address, hotel, supplier warehouse)"
                        className={`rounded-xl ${errors.sender_address ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                      />
                      {errors.sender_address && <p className="text-red-500 text-sm mt-1">{errors.sender_address.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supplier Tracking Code
                        </label>
                        <Input
                          {...register('supplier_tracking_code')}
                          placeholder="Tracking number from supplier (if any)"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Warehouse <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('delivery_warehouse', { required: 'Please select a warehouse' })}
                          className={`w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.delivery_warehouse ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                        >
                          <option value="">Select delivery warehouse</option>
                          <option value="guangzhou_baiyun">Guangzhou Baiyun Warehouse</option>
                          <option value="guangzhou_pazhou">Guangzhou Pazhou Warehouse</option>
                          <option value="yiwu">Yiwu Warehouse</option>
                          <option value="shenzhen">Shenzhen Warehouse</option>
                          <option value="dhaka">Dhaka Office</option>
                        </select>
                        {errors.delivery_warehouse && <p className="text-red-500 text-sm mt-1">{errors.delivery_warehouse.message}</p>}
                        {warehouseInfo && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-blue-900 text-sm">{warehouseInfo.name}</p>
                                <div className="mt-1.5 space-y-0.5">
                                  {warehouseInfo.address.split(', ').map((part, i) => (
                                    <p key={i} className="text-blue-800 text-xs sm:text-sm leading-relaxed">{part}</p>
                                  ))}
                                </div>
                                {warehouseInfo.contact && (
                                  <p className="text-blue-600 text-xs mt-2 pt-2 border-t border-blue-200">{warehouseInfo.contact}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={copyWarehouseAddress}
                                className="flex-shrink-0 flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                {copiedWarehouse ? (
                                  <><Check size={14} /> Copied!</>
                                ) : (
                                  <><Copy size={14} /> Copy</>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )}

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
                      <Send className="mr-2" size={20} />
                      Submit {config.title} Request
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
