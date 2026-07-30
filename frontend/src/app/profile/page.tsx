'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import {
  User, Package, FileText, Wrench, Truck, LogOut, Loader2,
  Mail, Phone, Building, Edit3, Save, Trash2, ChevronDown,
  ChevronUp, Eye, Shield, Calendar
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  quantity?: string;
  shipping_method?: string;
  price?: number;
  status: string;
  tracking_number?: string;
  created_at: string;
}

interface ProductRequest {
  id: string;
  product_name: string;
  status: string;
  tracking_number?: string;
  created_at: string;
}

interface ServiceRequest {
  id: string;
  service_type: string;
  status: string;
  tracking_number?: string;
  created_at: string;
}

interface EventRegistration {
  id: string;
  event_title: string;
  full_name: string;
  passport_number: string;
  business_name: string;
  business_type: string;
  division: string;
  district: string;
  status: string;
  admin_notes: string;
  passport_images: string | string[];
  business_certificate_images: string | string[];
  created_at: string;
}

type Tab = 'overview' | 'orders' | 'requests' | 'service-requests' | 'event-registrations';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUser } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', whatsapp: '', company: '' });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Read tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['overview', 'orders', 'requests', 'service-requests', 'event-registrations'].includes(tabParam)) {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, prRes, srRes, erRes] = await Promise.all([
        api.get('/customer/orders'),
        api.get('/customer/product-requests'),
        api.get('/customer/service-requests'),
        api.get('/customer/event-registrations').catch(() => ({ data: { data: [] } })),
      ]);
      setOrders(ordersRes.data.data || []);
      setProductRequests(prRes.data.data || []);
      setServiceRequests(srRes.data.data || []);
      setEventRegistrations(erRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        company: user.company || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/customer/profile', editForm);
      updateUser(res.data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/customer/orders/${id}`);
      setOrders(orders.filter(o => o.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteProductRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await api.delete(`/customer/product-requests/${id}`);
      setProductRequests(productRequests.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteServiceRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service request?')) return;
    try {
      await api.delete(`/customer/service-requests/${id}`);
      setServiceRequests(serviceRequests.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return null;

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: 'orders', label: 'Orders', icon: Package, count: orders.length },
    { key: 'requests', label: 'Product Requests', icon: FileText, count: productRequests.length },
    { key: 'service-requests', label: 'Service Requests', icon: Wrench, count: serviceRequests.length },
    { key: 'event-registrations', label: 'Event Registrations', icon: Calendar, count: eventRegistrations.length },
    { key: 'overview', label: 'My Profile', icon: User, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-primary-700 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              <User size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate">{user.name}</h1>
              <p className="text-white/80 text-sm truncate">{user.email}</p>
              {user.company && <p className="text-white/70 text-xs truncate">{user.company}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm"
            >
              <LogOut size={16} className="text-red-300" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {(error || success) && (
          <div className={`mb-4 px-4 py-3 rounded-lg ${error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {error || success}
          </div>
        )}

        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition text-sm min-w-fit ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  {!isEditing ? (
                    <button onClick={handleEditProfile} className="text-primary hover:text-primary-700 flex items-center gap-1 text-sm">
                      <Edit3 size={16} /> Edit
                    </button>
                  ) : (
                    <button onClick={handleSaveProfile} className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm">
                      <Save size={16} /> Save
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <Input value={editForm.whatsapp} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <Input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={18} className="text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone size={18} className="text-gray-400" />
                      <span>{user.phone || 'Not set'}</span>
                    </div>
                    {user.whatsapp && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={18} className="text-green-500" />
                        <span>WhatsApp: {user.whatsapp}</span>
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Building size={18} className="text-gray-400" />
                        <span>{user.company}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Package size={24} className="mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText size={24} className="mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{productRequests.length}</p>
                    <p className="text-gray-500 text-sm">Product Requests</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Wrench size={24} className="mx-auto text-secondary mb-2" />
                    <p className="text-2xl font-bold">{serviceRequests.length}</p>
                    <p className="text-gray-500 text-sm">Service Requests</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar size={24} className="mx-auto text-purple-500 mb-2" />
                    <p className="text-2xl font-bold">{eventRegistrations.length}</p>
                    <p className="text-gray-500 text-sm">Event Registrations</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link href="/wholesale-products" className="text-primary hover:underline mt-2 inline-block">Browse Products</Link>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-primary">#{order.order_number}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-gray-700 font-medium">{order.product_name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                          {order.tracking_number && (
                            <Link href={`/tracking?id=${order.tracking_number}`} className="flex items-center gap-1 hover:text-primary">
                              <Truck size={14} /> {order.tracking_number}
                            </Link>
                          )}
                          {order.shipping_method && <span>{order.shipping_method}</span>}
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.price && <span className="font-bold text-lg">৳{order.price}</span>}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>
            ) : productRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No product requests yet</p>
                  <Link href="/product-request" className="text-primary hover:underline mt-2 inline-block">Submit a Request</Link>
                </CardContent>
              </Card>
            ) : (
              productRequests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(req.status)}`}>
                            {getStatusLabel(req.status)}
                          </span>
                        </div>
                        <p className="text-gray-700 font-medium">{req.product_name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                          {req.tracking_number && (
                            <Link href={`/tracking?id=${req.tracking_number}`} className="flex items-center gap-1 hover:text-primary">
                              <Truck size={14} /> {req.tracking_number}
                            </Link>
                          )}
                          <span>{formatDate(req.created_at)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProductRequest(req.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete request"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'service-requests' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>
            ) : serviceRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No service requests yet</p>
                  <Link href="/services" className="text-primary hover:underline mt-2 inline-block">View Services</Link>
                </CardContent>
              </Card>
            ) : (
              serviceRequests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(req.status)}`}>
                            {getStatusLabel(req.status)}
                          </span>
                          <span className="text-sm text-gray-500">{req.service_type?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                          {req.tracking_number && (
                            <Link href={`/tracking?id=${req.tracking_number}`} className="flex items-center gap-1 hover:text-primary">
                              <Truck size={14} /> {req.tracking_number}
                            </Link>
                          )}
                          <span>{formatDate(req.created_at)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteServiceRequest(req.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete request"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'event-registrations' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>
            ) : eventRegistrations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No event registrations yet</p>
                  <Link href="/events" className="text-primary hover:underline mt-2 inline-block">View Events</Link>
                </CardContent>
              </Card>
            ) : (
              eventRegistrations.map((reg) => {
                const eventStatusColors: Record<string, string> = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  approved: 'bg-green-100 text-green-800',
                  rejected: 'bg-red-100 text-red-800',
                  contacted: 'bg-blue-100 text-blue-800',
                };
                const parseImages = (field: string | string[] | null): string[] => {
                  if (!field) return [];
                  if (Array.isArray(field)) return field;
                  try { const p = JSON.parse(field); return Array.isArray(p) ? p : []; } catch { return []; }
                };
                const passportImages = parseImages(reg.passport_images);
                const certImages = parseImages(reg.business_certificate_images);
                return (
                  <Card key={reg.id}>
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-primary">{reg.event_title}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${eventStatusColors[reg.status] || 'bg-gray-100 text-gray-800'}`}>
                              {reg.status}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium">{reg.full_name} - {reg.business_name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                            <span>{reg.division}, {reg.district}</span>
                            <span>Passport: {reg.passport_number}</span>
                            <span>{formatDate(reg.created_at)}</span>
                          </div>
                          {reg.admin_notes && (
                            <p className="text-sm text-blue-600 mt-1">Admin Notes: {reg.admin_notes}</p>
                          )}
                          {(passportImages.length > 0 || certImages.length > 0) && (
                            <div className="flex gap-2 mt-2">
                              {passportImages.slice(0, 2).map((img, i) => (
                                <img key={`p${i}`} src={img} alt={`Passport ${i+1}`} className="w-12 h-12 rounded object-cover" />
                              ))}
                              {certImages.slice(0, 2).map((img, i) => (
                                <img key={`c${i}`} src={img} alt={`Cert ${i+1}`} className="w-12 h-12 rounded object-cover" />
                              ))}
                              {(passportImages.length + certImages.length > 4) && (
                                <span className="text-xs text-gray-400 self-center">+{(passportImages.length + certImages.length) - 4} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
