'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, CheckCircle, Clock, XCircle, Loader2, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatShortDateTime } from '@/lib/utils';

interface TrackingData {
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

const SERVICE_TYPE_LABELS: Record<string, string> = {
  'product_sourcing': 'Product Sourcing',
  'wholesale_supply': 'Wholesale Supply',
  'air_cargo': 'Air Cargo',
  'sea_shipping': 'Sea Shipping',
  'hand_carry': 'Hand Carry',
  'canton_fair': 'Canton Fair Support',
};

const STATUS_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'received': Clock,
  'in_progress': Package,
  'completed': CheckCircle,
  'cancelled': XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  'received': 'bg-blue-500',
  'in_progress': 'bg-yellow-500',
  'completed': 'bg-green-500',
  'cancelled': 'bg-red-500',
};

export default function ServiceTrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<TrackingData | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsLoading(true);
    setError('');
    setData(null);

    try {
      const response = await api.get(`/service-request/track/${trackingNumber.trim()}`);
      setData(response.data.data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError?.response?.data?.error || 'No service request found with this tracking number.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatusIndex = data
    ? data.allStatuses.findIndex((s) => s.value === data.serviceRequest.status)
    : -1;

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
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
              Track Your <span className="text-yellow-300">Service Request</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-teal-100">
              Enter your tracking number to check the status of your service request.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-4 sm:py-8 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleTrack} className="flex gap-3">
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., SR1234567890)"
                  className="rounded-xl flex-1"
                />
                <Button type="submit" variant="gradient" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </Button>
              </form>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <XCircle size={18} />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {data && (
            <div className="max-w-2xl mx-auto mt-6 space-y-6">
              {/* Status Card */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Tracking Number</p>
                      <p className="text-lg font-bold text-primary">{data.serviceRequest.tracking_number}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white text-sm font-medium ${STATUS_COLORS[data.serviceRequest.status] || 'bg-gray-500'}`}>
                      {data.statusInfo.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Service Type</p>
                      <p className="font-medium">{SERVICE_TYPE_LABELS[data.serviceRequest.service_type] || data.serviceRequest.service_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">{data.serviceRequest.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{data.serviceRequest.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Submitted</p>
                      <p className="font-medium">{new Date(data.serviceRequest.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {data.serviceRequest.admin_notes && (
                    <div className="mt-4 bg-blue-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-blue-800">Admin Notes</p>
                      <p className="text-sm text-blue-700 mt-1">{data.serviceRequest.admin_notes}</p>
                    </div>
                  )}

                  {data.serviceRequest.price !== null && data.serviceRequest.price !== undefined && data.serviceRequest.price > 0 && (
                    <div className="mt-4 bg-green-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-green-800">Quoted Price</p>
                      <p className="text-2xl font-bold text-green-700">৳{data.serviceRequest.price}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Bar */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Request Progress</h3>
                  {(() => {
                    const stepTimes: Record<string, string | undefined> = {};
                    for (const t of (data.tracking || [])) {
                      if (!stepTimes[t.status]) stepTimes[t.status] = t.created_at;
                    }
                    if (!stepTimes['received']) stepTimes['received'] = data.serviceRequest.created_at;
                    return (
                  <div className="flex items-start justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
                      <div
                        className="h-full bg-primary rounded transition-all duration-500"
                        style={{ width: `${Math.max(0, (currentStatusIndex / (data.allStatuses.length - 1)) * 100)}%` }}
                      />
                    </div>
                    {data.allStatuses.map((status, index) => {
                      const StatusIcon = STATUS_ICONS[status.value] || Package;
                      const isCompleted = index < currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      const ts = stepTimes[status.value];
                      return (
                        <div key={status.value} className="relative flex flex-col items-center z-10 flex-1 min-w-[80px] px-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            isCompleted ? 'bg-primary border-primary text-white' :
                            isCurrent ? 'bg-primary border-primary text-white ring-4 ring-primary/20' :
                            'bg-white border-gray-300 text-gray-400'
                          }`}>
                            <StatusIcon size={18} />
                          </div>
                          <p className={`text-xs mt-2 text-center max-w-[100px] leading-tight ${
                            isCurrent ? 'font-bold text-primary' : isCompleted ? 'font-medium text-gray-700' : 'text-gray-400'
                          }`}>
                            {status.label}
                          </p>
                          {ts && (isCurrent || isCompleted) ? (
                            <p className="text-[10px] mt-1 text-center text-gray-500 font-medium">{formatShortDateTime(ts)}</p>
                          ) : (
                            <p className="text-[10px] mt-1 text-center text-gray-300">—</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                    );
                  })()}
                  <p className="text-sm text-gray-600 mt-4 text-center border-t pt-3">{data.statusInfo.description}</p>
                </CardContent>
              </Card>

              {/* Tracking History */}
              {data.tracking.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Tracking History</h3>
                    <div className="space-y-4">
                      {data.tracking.map((entry, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-primary rounded-full mt-1.5" />
                            {index < data.tracking.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-gray-900 capitalize">{entry.status.replace(/_/g, ' ')}</p>
                            {entry.location && <p className="text-sm text-gray-500">{entry.location}</p>}
                            {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
                            <p className="text-xs text-gray-400 mt-1">{new Date(entry.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Details */}
              {data.serviceRequest.parsedDetails && Object.keys(data.serviceRequest.parsedDetails).length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Request Details</h3>
                    <div className="space-y-3">
                      {Object.entries(data.serviceRequest.parsedDetails).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
