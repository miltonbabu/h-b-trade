'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Package, CheckCircle, Truck, Plane, Home, Loader2, Warehouse, Building, ClipboardCheck, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface TrackingData {
  order: {
    order_number: string;
    customer_name: string;
    product_name: string;
    quantity: string;
    shipping_method: string;
    status: string;
    tracking_number: string;
    created_at: string;
  };
  tracking: Array<{
    id: string;
    tracking_number: string;
    status: string;
    location: string;
    note: string;
    created_at: string;
  }>;
  statusInfo?: {
    value: string;
    label: string;
    description: string;
    icon: string;
    color: string;
    isCurrent: boolean;
  }[];
  allStatuses?: {
    value: string;
    label: string;
    description: string;
  }[];
}

const STATUS_CONFIG = {
  'pending': { icon: Package, color: 'yellow', bgColor: 'bg-yellow-500', label: 'Pending' },
  'processing': { icon: CheckCircle, color: 'blue', bgColor: 'bg-blue-500', label: 'Processing' },
  'guangzhou_warehouse': { icon: Warehouse, color: 'purple', bgColor: 'bg-purple-500', label: 'Guangzhou Warehouse' },
  'in_transit': { icon: Truck, color: 'indigo', bgColor: 'bg-indigo-500', label: 'In Transit' },
  'dhaka_customs': { icon: ClipboardCheck, color: 'orange', bgColor: 'bg-orange-500', label: 'Dhaka Customs' },
  'dhaka_office': { icon: Building, color: 'teal', bgColor: 'bg-teal-500', label: 'Dhaka Office' },
  'delivered': { icon: CheckCircle, color: 'green', bgColor: 'bg-green-500', label: 'Delivered' },
  'cancelled': { icon: XCircle, color: 'red', bgColor: 'bg-red-500', label: 'Cancelled' },
};

const STATUS_SEQUENCE = [
  { value: 'pending', label: 'Pending', description: 'Order received, awaiting processing' },
  { value: 'processing', label: 'Processing', description: 'Order is being prepared' },
  { value: 'guangzhou_warehouse', label: 'Guangzhou Warehouse', description: 'Package received at Guangzhou warehouse' },
  { value: 'in_transit', label: 'In Transit', description: 'Package is in transit to Bangladesh' },
  { value: 'dhaka_customs', label: 'Dhaka Customs', description: 'Package is at Dhaka customs' },
  { value: 'dhaka_office', label: 'Dhaka Office', description: 'Package arrived at Dhaka office' },
  { value: 'delivered', label: 'Delivered', description: 'Package delivered to customer' },
];

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setIsLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const response = await api.get(`/track/${trackingNumber}`);
      setTrackingData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tracking information not found');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    return config?.icon || Package;
  };

  const getStatusColor = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    return config?.bgColor || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    return config?.label || status;
  };

  const getCurrentStatusIndex = (status: string) => {
    return STATUS_SEQUENCE.findIndex(s => s.value === status);
  };

  return (
    <div>
      <section className="hero-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Track Your Shipment
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Enter your tracking number to get real-time updates on your shipment status.
            </p>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., TRK1234567890)"
                  className="bg-white text-gray-900"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Search size={20} />
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <p className="text-red-300 mt-4">{error}</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {trackingData ? (
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Order Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Order Number</p>
                      <p className="font-semibold">{trackingData.order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tracking Number</p>
                      <p className="font-semibold text-blue-600">{trackingData.order.tracking_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Customer Name</p>
                      <p className="font-semibold">{trackingData.order.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Product</p>
                      <p className="font-semibold">{trackingData.order.product_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-semibold">{trackingData.order.quantity || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Shipping Method</p>
                      <p className="font-semibold">{trackingData.order.shipping_method || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(trackingData.order.status)}`}>
                        {getStatusLabel(trackingData.order.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Order Date</p>
                      <p className="font-semibold">{formatDate(trackingData.order.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Shipment Progress</h2>
                  
                  <div className="relative">
                    {STATUS_SEQUENCE.map((status, index) => {
                      const currentIndex = getCurrentStatusIndex(trackingData.order.status);
                      const isCompleted = index <= currentIndex && currentIndex !== -1;
                      const isCurrent = index === currentIndex;
                      const StatusIcon = status.value === 'cancelled' ? XCircle : getStatusIcon(status.value);
                      
                      return (
                        <div key={status.value} className="flex gap-4 pb-8 last:pb-0">
                          {index !== STATUS_SEQUENCE.length - 1 && (
                            <div 
                              className={`absolute left-5 top-12 w-0.5 h-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} 
                              style={{ transform: 'translateX(-50%)' }} 
                            />
                          )}
                          
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted 
                              ? (status.value === 'cancelled' ? 'bg-red-500' : 'bg-green-500') 
                              : 'bg-gray-300'
                          }`}>
                            <StatusIcon className="text-white" size={20} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                              <h3 className={`font-semibold text-lg ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                {status.label}
                                {isCurrent && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Current</span>}
                              </h3>
                            {trackingData.tracking.find(t => t.status === status.value)?.created_at && (
                                <p className="text-gray-500 text-sm">
                                  {formatDate(trackingData.tracking.find(t => t.status === status.value)?.created_at || '')}
                                </p>
                              )}
                            </div>
                            <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                              {status.description}
                            </p>
                            {trackingData.tracking.find(t => t.status === status.value)?.location && (
                              <p className="text-gray-500 text-sm mt-1">
                                📍 {trackingData.tracking.find(t => t.status === status.value)?.location}
                              </p>
                            )}
                            {trackingData.tracking.find(t => t.status === status.value)?.note && (
                              <p className="text-gray-500 text-sm mt-1 italic">
                                {trackingData.tracking.find(t => t.status === status.value)?.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {trackingData.order.status === 'cancelled' && (
                <Card className="mb-8 border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <XCircle className="text-red-500" size={24} />
                      <div>
                        <h3 className="font-semibold text-red-800">Order Cancelled</h3>
                        <p className="text-red-600 text-sm">
                          This order has been cancelled. Please contact our support team for more information.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {trackingData.order.status === 'delivered' && (
                <Card className="mb-8 border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={24} />
                      <div>
                        <h3 className="font-semibold text-green-800">Successfully Delivered!</h3>
                        <p className="text-green-600 text-sm">
                          Your package has been delivered. Thank you for choosing H&B Trade!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {trackingData.tracking.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Detailed Tracking History</h2>
                    
                    <div className="relative">
                      {trackingData.tracking.map((track, index) => {
                        const StatusIcon = getStatusIcon(track.status);
                        return (
                          <div key={track.id} className="flex gap-4 pb-6 last:pb-0">
                            {index !== trackingData.tracking.length - 1 && (
                              <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" style={{ transform: 'translateX(-50%)' }} />
                            )}
                            
                            <div className={`relative z-10 w-10 h-10 rounded-full ${getStatusColor(track.status)} flex items-center justify-center flex-shrink-0`}>
                              <StatusIcon className="text-white" size={20} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                                <h3 className="font-semibold text-lg">{getStatusLabel(track.status)}</h3>
                                <p className="text-gray-500 text-sm">{formatDate(track.created_at)}</p>
                              </div>
                              {track.location && (
                                <p className="text-gray-600">📍 Location: {track.location}</p>
                              )}
                              {track.note && (
                                <p className="text-gray-500 text-sm mt-1">{track.note}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <Card>
                <CardContent className="p-12">
                  <Package className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold mb-2">Track Your Shipment</h3>
                  <p className="text-gray-600">
                    Enter your tracking number above to see your shipment status and delivery updates.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Need Help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Lost Tracking Number?</h3>
                  <p className="text-gray-600 text-sm">Contact us with your order details and we&apos;ll help you find it.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Shipment Delayed?</h3>
                  <p className="text-gray-600 text-sm">Delays can happen due to customs or weather. Contact us for updates.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Delivery Issues?</h3>
                  <p className="text-gray-600 text-sm">If you have delivery problems, reach out to our support team.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
