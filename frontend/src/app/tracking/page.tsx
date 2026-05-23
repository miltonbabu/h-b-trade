'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Package, CheckCircle, Truck, Plane, Home, Loader2, Warehouse, Building, ClipboardCheck, XCircle, ShoppingCart, Ship, Users, Globe, Clock, Wrench } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatDateTime, formatShortDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface OrderTrackingData {
  type: 'order';
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
  statusInfo: {
    label: string;
    description: string;
    icon: string;
    color: string;
  };
  allStatuses: Array<{
    value: string;
    label: string;
    description: string;
    isCurrent: boolean;
  }>;
}

interface ServiceTrackingData {
  type: 'service';
  serviceRequest: {
    id: string;
    service_type: string;
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    company?: string;
    parsedDetails?: Record<string, string>;
    message?: string;
    status: string;
    tracking_number: string;
    admin_notes?: string;
    price?: number;
    created_at: string;
    updated_at: string;
  };
  linkedOrder?: {
    order_number: string;
    status: string;
    tracking_number: string;
  } | null;
  tracking: Array<{
    status: string;
    location?: string;
    note?: string;
    created_at: string;
  }>;
  statusInfo: {
    label: string;
    description: string;
    icon: string;
    color: string;
  };
  allStatuses: Array<{
    value: string;
    label: string;
    description: string;
    isCurrent: boolean;
  }>;
}

interface ProductRequestTrackingData {
  type: 'product_request';
  request: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    product_name: string;
    product_link?: string;
    quantity?: string;
    shipping_method?: string;
    message?: string;
    status: string;
    tracking_number: string;
    image?: string;
    created_at: string;
  };
  linkedOrder?: {
    order_number: string;
    status: string;
    tracking_number: string;
  } | null;
  tracking: Array<{
    status: string;
    location?: string;
    note?: string;
    created_at: string;
  }>;
}

type TrackingData = OrderTrackingData | ServiceTrackingData | ProductRequestTrackingData;

const TRACKING_PREFIX_INFO: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  'TRK': { label: 'Order', icon: Package, color: 'bg-blue-500' },
  'HB': { label: 'Order', icon: Package, color: 'bg-blue-500' },
  'PR': { label: 'Product Request', icon: ShoppingCart, color: 'bg-green-500' },
  'PS': { label: 'Product Sourcing', icon: ShoppingCart, color: 'bg-blue-500' },
  'WS': { label: 'Wholesale Supply', icon: Package, color: 'bg-purple-500' },
  'AC': { label: 'Air Cargo', icon: Plane, color: 'bg-teal-500' },
  'SS': { label: 'Sea Shipping', icon: Ship, color: 'bg-orange-500' },
  'HC': { label: 'Hand Carry', icon: Users, color: 'bg-pink-500' },
  'CF': { label: 'Canton Fair', icon: Globe, color: 'bg-amber-500' },
  'SR': { label: 'Service Request', icon: Wrench, color: 'bg-teal-500' },
};

const ORDER_STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; bgColor: string; label: string }> = {
  'pending': { icon: Package, bgColor: 'bg-yellow-500', label: 'Pending' },
  'processing': { icon: CheckCircle, bgColor: 'bg-blue-500', label: 'Processing' },
  'guangzhou_warehouse': { icon: Warehouse, bgColor: 'bg-purple-500', label: 'Guangzhou Warehouse' },
  'in_transit': { icon: Truck, bgColor: 'bg-indigo-500', label: 'In Transit' },
  'dhaka_customs': { icon: ClipboardCheck, bgColor: 'bg-orange-500', label: 'Dhaka Customs' },
  'dhaka_office': { icon: Building, bgColor: 'bg-teal-500', label: 'Dhaka Office' },
  'delivered': { icon: CheckCircle, bgColor: 'bg-green-500', label: 'Delivered' },
  'cancelled': { icon: XCircle, bgColor: 'bg-red-500', label: 'Cancelled' },
};

const SERVICE_STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; bgColor: string; label: string }> = {
  'received': { icon: Clock, bgColor: 'bg-blue-500', label: 'Received' },
  'in_progress': { icon: Wrench, bgColor: 'bg-yellow-500', label: 'In Progress' },
  'completed': { icon: CheckCircle, bgColor: 'bg-green-500', label: 'Completed' },
  'cancelled': { icon: XCircle, bgColor: 'bg-red-500', label: 'Cancelled' },
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  'product_sourcing': 'Product Sourcing',
  'wholesale_supply': 'Wholesale Supply',
  'air_cargo': 'Air Cargo',
  'sea_shipping': 'Sea Shipping',
  'hand_carry': 'Hand Carry',
  'canton_fair': 'Canton Fair Support',
};

function getPrefix(trackingNumber: string): string {
  const match = trackingNumber.match(/^[A-Z]+/);
  return match ? match[0] : '';
}

export default function UnifiedTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<TrackingData | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [myTrackingNumbers, setMyTrackingNumbers] = useState<Array<{ tracking_number: string; type: string; label: string; status: string; created_at: string }>>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchMyTracking = async () => {
      try {
        const [ordersRes, prRes, srRes] = await Promise.all([
          api.get('/customer/orders'),
          api.get('/customer/product-requests'),
          api.get('/customer/service-requests'),
        ]);
        const items: Array<{ tracking_number: string; type: string; label: string; status: string; created_at: string }> = [];
        for (const o of ordersRes.data.data || []) {
          if (o.tracking_number) items.push({ tracking_number: o.tracking_number, type: 'order', label: `Order #${o.order_number}`, status: o.status, created_at: o.created_at });
        }
        for (const r of prRes.data.data || []) {
          if (r.tracking_number) items.push({ tracking_number: r.tracking_number, type: 'product_request', label: r.product_name, status: r.status, created_at: r.created_at });
        }
        for (const r of srRes.data.data || []) {
          if (r.tracking_number) items.push({ tracking_number: r.tracking_number, type: 'service', label: r.service_type?.replace(/_/g, ' '), status: r.status, created_at: r.created_at });
        }
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setMyTrackingNumbers(items);
      } catch {}
    };
    fetchMyTracking();
  }, [isAuthenticated]);

  const handleTrackFromList = (tn: string) => {
    setTrackingNumber(tn);
    setIsLoading(true);
    setError('');
    setData(null);
    api.get(`/track/${tn}`)
      .then((response) => {
        if (response.data.data) {
          setData({ type: response.data.type, ...response.data.data });
        } else {
          setError('No tracking information found.');
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error || 'No tracking information found.');
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => {
          document.getElementById('tracking-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsLoading(true);
    setError('');
    setData(null);

    try {
      const response = await api.get(`/track/${trackingNumber.trim()}`);
      const responseData = response.data;
      if (responseData.data) {
        setData({ type: responseData.type, ...responseData.data });
      } else {
        setError('No tracking information found for this number.');
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError?.response?.data?.error || 'No tracking information found for this number.');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        document.getElementById('tracking-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const prefix = data ? getPrefix(
    data.type === 'order' ? data.order?.tracking_number :
    data.type === 'service' ? data.serviceRequest?.tracking_number :
    data.request?.tracking_number || ''
  ) : '';
  const prefixInfo = TRACKING_PREFIX_INFO[prefix] || TRACKING_PREFIX_INFO['SR'];
  const PrefixIcon = prefixInfo.icon;

  return (
    <div>
      {/* Hero */}
      <section className="relative hero-gradient text-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Track Your <span className="text-yellow-300">Shipment & Requests</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-4 sm:mb-6 md:mb-8">
              Enter your tracking number to get real-time updates. Works for orders, service requests, and product requests.
            </p>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative z-10">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., TRK..., HB..., PR..., SR...)"
                  className="bg-white text-gray-900 z-10"
                  autoFocus
                />
                <Button type="submit" disabled={isLoading} className="z-10">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </Button>
              </div>
            </form>

            {/* Prefix Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"><b>TRK</b> = Order</span>
              <span className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"><b>HB</b> = Order</span>
              <span className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"><b>PR</b> = Product Request</span>
              <span className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"><b>SR</b> = Service Request</span>
              <span className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"><b>PS</b> = Product Sourcing</span>
              <span className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"><b>AC</b> = Air Cargo</span>
              <span className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"><b>SS</b> = Sea Shipping</span>
              <span className="text-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"><b>HC</b> = Hand Carry</span>
            </div>

            {error && <p className="text-red-300 mt-4">{error}</p>}
          </div>
        </div>
      </section>

      {/* My Tracking Numbers - for logged in customers */}
      {isAuthenticated && myTrackingNumbers.length > 0 && (
        <section className="py-6 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">My Tracking Numbers</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {myTrackingNumbers.map((item) => {
                const prefix = getPrefix(item.tracking_number);
                const prefixInfo = TRACKING_PREFIX_INFO[prefix] || TRACKING_PREFIX_INFO['SR'];
                const Icon = prefixInfo.icon;
                const statusColor = item.status === 'delivered' || item.status === 'completed' ? 'bg-green-100 text-green-700' : item.status === 'pending' || item.status === 'received' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';
                return (
                  <button
                    key={item.tracking_number}
                    onClick={() => handleTrackFromList(item.tracking_number)}
                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-primary hover:shadow-sm transition text-left ${trackingNumber === item.tracking_number ? 'border-primary shadow-sm' : 'border-gray-200'}`}
                  >
                    <div className={`w-8 h-8 ${prefixInfo.color} rounded flex items-center justify-center shrink-0`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                      <p className="text-xs text-gray-500 truncate">{item.tracking_number}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${statusColor}`}>
                      {item.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section id="tracking-results" className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          {data ? (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Type Badge */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${prefixInfo.color} rounded-lg flex items-center justify-center`}>
                  <PrefixIcon className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tracking Type</p>
                  <p className="font-semibold">{prefixInfo.label}</p>
                </div>
              </div>

              {/* ORDER TYPE */}
              {data.type === 'order' && (() => {
                // Map each status to its most recent tracking timestamp (tracking is ORDER BY created_at DESC)
                const timeForStatus: Record<string, string | undefined> = {};
                for (const t of (data.tracking || [])) {
                  if (!timeForStatus[t.status]) timeForStatus[t.status] = t.created_at;
                }
                // Order created_at is the implicit "pending" timestamp if nothing else is set
                if (!timeForStatus['pending']) timeForStatus['pending'] = data.order.created_at;
                const currentIdx = data.allStatuses.findIndex(s => s.isCurrent);

                return (
                <>
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-xl font-bold mb-4">Order Details</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div><p className="text-gray-500 text-sm">Order Number</p><p className="font-semibold">{data.order.order_number}</p></div>
                        <div><p className="text-gray-500 text-sm">Tracking Number</p><p className="font-semibold text-blue-600">{data.order.tracking_number}</p></div>
                        <div><p className="text-gray-500 text-sm">Customer</p><p className="font-semibold">{data.order.customer_name}</p></div>
                        <div><p className="text-gray-500 text-sm">Product</p><p className="font-semibold">{data.order.product_name}</p></div>
                        <div><p className="text-gray-500 text-sm">Quantity</p><p className="font-semibold">{data.order.quantity || 'N/A'}</p></div>
                        <div><p className="text-gray-500 text-sm">Shipping</p><p className="font-semibold">{data.order.shipping_method || 'N/A'}</p></div>
                        <div><p className="text-gray-500 text-sm">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${ORDER_STATUS_CONFIG[data.order.status]?.bgColor || 'bg-gray-500'}`}>
                            {ORDER_STATUS_CONFIG[data.order.status]?.label || data.order.status}
                          </span>
                        </div>
                        <div><p className="text-gray-500 text-sm">Order Date</p><p className="font-semibold">{formatDateTime(data.order.created_at)}</p></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Visual Order Progress Timeline with per-step timestamps */}
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-xl font-bold mb-6">Shipment Progress</h2>
                      <div className="overflow-x-auto pb-2">
                        <div className="flex items-start justify-between relative min-w-[640px]">
                          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
                            <div
                              className="h-full bg-primary rounded transition-all duration-500"
                              style={{ width: currentIdx >= 0 && data.allStatuses.length > 1 ? `${Math.max(0, (currentIdx / (data.allStatuses.length - 1)) * 100)}%` : '0%' }}
                            />
                          </div>
                          {data.allStatuses.map((status, idx) => {
                            const cfg = ORDER_STATUS_CONFIG[status.value] || { icon: Package, bgColor: 'bg-gray-500', label: status.label };
                            const Icon = cfg.icon;
                            const isPast = currentIdx > idx;
                            const isCurrent = status.isCurrent;
                            const ts = timeForStatus[status.value];
                            return (
                              <div key={status.value} className="relative flex flex-col items-center z-10 flex-1 min-w-[80px] px-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                  isCurrent ? `${cfg.bgColor} border-current text-white ring-4 ring-primary/20` :
                                  isPast ? `${cfg.bgColor} border-transparent text-white` :
                                  'bg-white border-gray-300 text-gray-400'
                                }`}>
                                  <Icon size={18} />
                                </div>
                                <p className={`text-xs mt-2 text-center max-w-[100px] leading-tight ${isCurrent ? 'font-bold text-primary' : isPast ? 'font-medium text-gray-700' : 'text-gray-400'}`}>{cfg.label || status.label}</p>
                                {ts && (isCurrent || isPast) ? (
                                  <p className="text-[10px] mt-1 text-center text-gray-500 font-medium">{formatShortDateTime(ts)}</p>
                                ) : (
                                  <p className="text-[10px] mt-1 text-center text-gray-300">—</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {data.statusInfo?.description && (
                        <p className="text-sm text-gray-600 text-center mt-4 border-t pt-3">{data.statusInfo.description}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Detailed Tracking History */}
                  {data.tracking.length > 0 && (
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h2 className="text-xl font-bold mb-4">Tracking History</h2>
                        <div className="space-y-4">
                          {data.tracking.map((track, index) => {
                            const cfg = ORDER_STATUS_CONFIG[track.status] || { icon: Package, bgColor: 'bg-gray-500', label: track.status };
                            const Icon = cfg.icon;
                            return (
                              <div key={index} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full ${cfg.bgColor} flex items-center justify-center flex-shrink-0`}>
                                  <Icon className="text-white" size={18} />
                                </div>
                                <div>
                                  <p className="font-semibold">{cfg.label}</p>
                                  {track.location && <p className="text-sm text-gray-600">📍 {track.location}</p>}
                                  {track.note && <p className="text-sm text-gray-500">{track.note}</p>}
                                  <p className="text-xs text-gray-400">{formatDateTime(track.created_at)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
                );
              })()}

              {/* SERVICE REQUEST TYPE */}
              {data.type === 'service' && (
                <>
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-xl font-bold mb-4">Service Request Details</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div><p className="text-gray-500 text-sm">Tracking Number</p><p className="font-semibold text-blue-600">{data.serviceRequest.tracking_number}</p></div>
                        <div><p className="text-gray-500 text-sm">Service Type</p><p className="font-semibold">{SERVICE_TYPE_LABELS[data.serviceRequest.service_type] || data.serviceRequest.service_type}</p></div>
                        <div><p className="text-gray-500 text-sm">Name</p><p className="font-semibold">{data.serviceRequest.name}</p></div>
                        <div><p className="text-gray-500 text-sm">Email</p><p className="font-semibold">{data.serviceRequest.email}</p></div>
                        <div><p className="text-gray-500 text-sm">Phone</p><p className="font-semibold">{data.serviceRequest.phone || '-'}</p></div>
                        <div><p className="text-gray-500 text-sm">Company</p><p className="font-semibold">{data.serviceRequest.company || '-'}</p></div>
                        <div><p className="text-gray-500 text-sm">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${SERVICE_STATUS_CONFIG[data.serviceRequest.status]?.bgColor || 'bg-gray-500'}`}>
                            {SERVICE_STATUS_CONFIG[data.serviceRequest.status]?.label || data.serviceRequest.status}
                          </span>
                        </div>
                        <div><p className="text-gray-500 text-sm">Submitted</p><p className="font-semibold">{formatDate(data.serviceRequest.created_at)}</p></div>
                      </div>

                      {data.serviceRequest.admin_notes && (
                        <div className="mt-4 bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-800">Admin Notes</p>
                          <p className="text-sm text-blue-700">{data.serviceRequest.admin_notes}</p>
                        </div>
                      )}

                      {data.serviceRequest.price !== null && data.serviceRequest.price !== undefined && data.serviceRequest.price > 0 && (
                        <div className="mt-4 bg-green-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800">Quoted Price</p>
                          <p className="text-xl font-bold text-green-700">৳{data.serviceRequest.price}</p>
                        </div>
                      )}

                      {/* Show linked order if converted */}
                      {data.linkedOrder && (
                        <div className="mt-4 bg-purple-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-purple-800">Converted to Order</p>
                          <p className="text-sm text-purple-700">Your service request has been converted to an order.</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-gray-500">Order:</span> <span className="font-semibold">{data.linkedOrder.order_number}</span></div>
                            <div><span className="text-gray-500">Status:</span> <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white ${ORDER_STATUS_CONFIG[data.linkedOrder.status]?.bgColor || 'bg-gray-500'}`}>{ORDER_STATUS_CONFIG[data.linkedOrder.status]?.label || data.linkedOrder.status}</span></div>
                          </div>
                          <p className="text-xs text-purple-600 mt-2">Your tracking number <b>{data.serviceRequest.tracking_number}</b> now tracks this order. Check back for shipping updates!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Service Details */}
                  {data.serviceRequest.parsedDetails && Object.keys(data.serviceRequest.parsedDetails).length > 0 && (
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h2 className="text-xl font-bold mb-4">Request Details</h2>
                        <div className="space-y-2">
                          {Object.entries(data.serviceRequest.parsedDetails).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                              <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="text-gray-900 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Service Progress */}
                  {(() => {
                    const srTimes: Record<string, string | undefined> = {};
                    for (const t of (data.tracking || [])) {
                      if (!srTimes[t.status]) srTimes[t.status] = t.created_at;
                    }
                    if (!srTimes['received']) srTimes['received'] = data.serviceRequest.created_at;
                    const currentIdx = data.allStatuses.findIndex(s => s.isCurrent);
                    return (
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-xl font-bold mb-4">Request Progress</h2>
                      <div className="flex items-start justify-between relative mb-4">
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
                          <div
                            className="h-full bg-primary rounded transition-all duration-500"
                            style={{ width: currentIdx >= 0 && data.allStatuses.length > 1 ? `${Math.max(0, (currentIdx / (data.allStatuses.length - 1)) * 100)}%` : '0%' }}
                          />
                        </div>
                        {data.allStatuses.map((status, idx) => {
                          const cfg = SERVICE_STATUS_CONFIG[status.value] || { icon: Clock, bgColor: 'bg-gray-500' };
                          const Icon = cfg.icon;
                          const isPast = currentIdx > idx;
                          const isCurrent = status.isCurrent;
                          const ts = srTimes[status.value];
                          return (
                            <div key={status.value} className="relative flex flex-col items-center z-10 flex-1 min-w-[80px] px-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                isCurrent ? `${cfg.bgColor} border-current text-white ring-4 ring-primary/20` :
                                isPast ? `${cfg.bgColor} border-transparent text-white` :
                                'bg-white border-gray-300 text-gray-400'
                              }`}>
                                <Icon size={18} />
                              </div>
                              <p className={`text-xs mt-2 text-center max-w-[100px] leading-tight ${isCurrent ? 'font-bold text-primary' : isPast ? 'font-medium text-gray-700' : 'text-gray-400'}`}>{status.label}</p>
                              {ts && (isCurrent || isPast) ? (
                                <p className="text-[10px] mt-1 text-center text-gray-500 font-medium">{formatShortDateTime(ts)}</p>
                              ) : (
                                <p className="text-[10px] mt-1 text-center text-gray-300">—</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-600 text-center border-t pt-3">{data.statusInfo.description}</p>
                    </CardContent>
                  </Card>
                    );
                  })()}

                  {/* Tracking History */}
                  {data.tracking.length > 0 && (
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h2 className="text-xl font-bold mb-4">Tracking History</h2>
                        <div className="space-y-4">
                          {data.tracking.map((entry, index) => {
                            const cfg = SERVICE_STATUS_CONFIG[entry.status] || { icon: Clock, bgColor: 'bg-gray-500', label: entry.status };
                            const Icon = cfg.icon;
                            return (
                              <div key={index} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full ${cfg.bgColor} flex items-center justify-center flex-shrink-0`}>
                                  <Icon className="text-white" size={18} />
                                </div>
                                <div>
                                  <p className="font-semibold">{cfg.label}</p>
                                  {entry.location && <p className="text-sm text-gray-600">📍 {entry.location}</p>}
                                  {entry.note && <p className="text-sm text-gray-500">{entry.note}</p>}
                                  <p className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* PRODUCT REQUEST TYPE */}
              {data.type === 'product_request' && (
                <>
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-xl font-bold mb-4">Product Request Details</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div><p className="text-gray-500 text-sm">Tracking Number</p><p className="font-semibold text-blue-600">{data.request.tracking_number}</p></div>
                        <div><p className="text-gray-500 text-sm">Name</p><p className="font-semibold">{data.request.name}</p></div>
                        <div><p className="text-gray-500 text-sm">Email</p><p className="font-semibold">{data.request.email}</p></div>
                        <div><p className="text-gray-500 text-sm">Product</p><p className="font-semibold">{data.request.product_name}</p></div>
                        <div><p className="text-gray-500 text-sm">Quantity</p><p className="font-semibold">{data.request.quantity || '-'}</p></div>
                        <div><p className="text-gray-500 text-sm">Shipping</p><p className="font-semibold">{data.request.shipping_method || '-'}</p></div>
                        <div><p className="text-gray-500 text-sm">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${
                            data.request.status === 'pending' ? 'bg-yellow-500' :
                            data.request.status === 'processing' ? 'bg-blue-500' :
                            data.request.status === 'converted' ? 'bg-purple-500' :
                            data.request.status === 'completed' ? 'bg-green-500' :
                            'bg-red-500'
                          }`}>{data.request.status === 'converted' ? 'Converted to Order' : data.request.status}</span>
                        </div>
                        <div><p className="text-gray-500 text-sm">Submitted</p><p className="font-semibold">{formatDate(data.request.created_at)}</p></div>
                      </div>
                      {data.request.message && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700">Message</p>
                          <p className="text-sm text-gray-600">{data.request.message}</p>
                        </div>
                      )}

                      {/* Show linked order if converted */}
                      {data.request.status === 'converted' && data.linkedOrder && (
                        <div className="mt-4 bg-purple-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-purple-800">Converted to Order</p>
                          <p className="text-sm text-purple-700">Your request has been converted to an order.</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-gray-500">Order:</span> <span className="font-semibold">{data.linkedOrder.order_number}</span></div>
                            <div><span className="text-gray-500">Status:</span> <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white ${ORDER_STATUS_CONFIG[data.linkedOrder.status]?.bgColor || 'bg-gray-500'}`}>{ORDER_STATUS_CONFIG[data.linkedOrder.status]?.label || data.linkedOrder.status}</span></div>
                          </div>
                          <p className="text-xs text-purple-600 mt-2">Your tracking number <b>{data.request.tracking_number}</b> now tracks this order. Check back for shipping updates!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {data.tracking.length > 0 && (
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h2 className="text-xl font-bold mb-4">Tracking History</h2>
                        <div className="space-y-4">
                          {data.tracking.map((entry, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Package className="text-white" size={18} />
                              </div>
                              <div>
                                <p className="font-semibold capitalize">{entry.status.replace(/_/g, ' ')}</p>
                                {entry.location && <p className="text-sm text-gray-600">📍 {entry.location}</p>}
                                {entry.note && <p className="text-sm text-gray-500">{entry.note}</p>}
                                <p className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <Card>
                <CardContent className="p-6 sm:p-8 md:p-12">
                  <Package className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold mb-2">Track Your Shipment & Requests</h3>
                  <p className="text-gray-600 mb-4">
                    Enter your tracking number above to see status updates for orders, product requests, or service requests.
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-xs mb-4">
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-blue-600">TRK</p>
                      <p className="text-gray-500">Order</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-blue-600">HB</p>
                      <p className="text-gray-500">Order</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-green-600">PR</p>
                      <p className="text-gray-500">Product Req</p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-teal-600">SR</p>
                      <p className="text-gray-500">Service</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-blue-600">PS</p>
                      <p className="text-gray-500">Sourcing</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-orange-600">AC</p>
                      <p className="text-gray-500">Air Cargo</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-orange-600">SS</p>
                      <p className="text-gray-500">Sea Ship</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-pink-600">HC</p>
                      <p className="text-gray-500">Hand Carry</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Help Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4 sm:mb-6 md:mb-8">Need Help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="text-center">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Lost Tracking Number?</h3>
                  <p className="text-gray-600 text-sm">Contact us with your order details and we&apos;ll help you find it.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Shipment Delayed?</h3>
                  <p className="text-gray-600 text-sm">Delays can happen due to customs or weather. Contact us for updates.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4 sm:p-6">
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
