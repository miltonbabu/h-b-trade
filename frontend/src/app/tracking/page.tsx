'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Package, CheckCircle, Truck, Plane, Home, Loader2 } from 'lucide-react';
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
}

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
    const statusLower = status.toLowerCase();
    if (statusLower.includes('order') || statusLower.includes('pending')) return Package;
    if (statusLower.includes('processing') || statusLower.includes('preparing')) return CheckCircle;
    if (statusLower.includes('transit') || statusLower.includes('shipped')) return Truck;
    if (statusLower.includes('air') || statusLower.includes('flight')) return Plane;
    if (statusLower.includes('delivered') || statusLower.includes('received')) return Home;
    return Package;
  };

  const getStatusColor = (index: number, total: number) => {
    if (index === 0) return 'bg-green-500';
    return 'bg-gray-300';
  };

  return (
    <div>
      {/* Hero Section */}
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
                  placeholder="Enter tracking number (e.g., HB12345678)"
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

      {/* Results Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {trackingData ? (
            <div className="max-w-4xl mx-auto">
              {/* Order Summary */}
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
                      <p className="font-semibold">{trackingData.order.tracking_number}</p>
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
                      <p className="text-gray-600">Status</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {trackingData.order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Order Date</p>
                      <p className="font-semibold">{formatDate(trackingData.order.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Tracking History</h2>
                  
                  {trackingData.tracking.length > 0 ? (
                    <div className="relative">
                      {trackingData.tracking.map((track, index) => {
                        const StatusIcon = getStatusIcon(track.status);
                        return (
                          <div key={track.id} className="flex gap-4 pb-8 last:pb-0">
                            {/* Timeline line */}
                            {index !== trackingData.tracking.length - 1 && (
                              <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" style={{ transform: 'translateX(-50%)' }} />
                            )}
                            
                            {/* Icon */}
                            <div className={`relative z-10 w-10 h-10 rounded-full ${getStatusColor(index, trackingData.tracking.length)} flex items-center justify-center flex-shrink-0`}>
                              <StatusIcon className="text-white" size={20} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                                <h3 className="font-semibold text-lg">{track.status}</h3>
                                <p className="text-gray-500 text-sm">{formatDate(track.created_at)}</p>
                              </div>
                              {track.location && (
                                <p className="text-gray-600">Location: {track.location}</p>
                              )}
                              {track.note && (
                                <p className="text-gray-500 text-sm mt-1">{track.note}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="mx-auto mb-4" size={48} />
                      <p>No tracking updates available yet. Please check back later.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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

      {/* Help Section */}
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
