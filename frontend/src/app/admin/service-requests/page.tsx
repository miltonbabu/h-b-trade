'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FileText, Eye, Trash2, X, ArrowRight, CheckCircle, Save, ShoppingCart, Package, Plane, Ship, Users, Globe } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ServiceRequest } from '@/types';

const SERVICE_TYPE_LABELS: Record<string, string> = {
  'product_sourcing': 'Product Sourcing',
  'wholesale_supply': 'Wholesale Supply',
  'air_cargo': 'Air Cargo',
  'sea_shipping': 'Sea Shipping',
  'hand_carry': 'Hand Carry',
  'canton_fair': 'Canton Fair',
};

const SERVICE_TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'product_sourcing': ShoppingCart,
  'wholesale_supply': Package,
  'air_cargo': Plane,
  'sea_shipping': Ship,
  'hand_carry': Users,
  'canton_fair': Globe,
};

const STATUS_COLORS: Record<string, string> = {
  'received': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  'received': 'Received',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

const DETAIL_LABELS: Record<string, string> = {
  product_name: 'Product Name',
  product_link: 'Product Link / Reference',
  target_price: 'Target Price (USD)',
  quantity: 'Quantity',
  packaging_type: 'Packaging Type',
  pack_quantity: 'Qty per Pack / Inner Unit',
  master_pack_quantity: 'Qty per Master Pack / Outer Unit',
  pack_dimensions: 'Master Pack Dimensions (L×W×H cm)',
  weight_per_pack: 'Weight per Master Pack (kg)',
  specifications: 'Specifications / Requirements',
  sample_needed: 'Sample Needed?',
  product_category: 'Product Category',
  product_names: 'Specific Products Needed',
  budget_range: 'Total Budget Range (USD)',
  cargo_description: 'Cargo Description',
  total_packs: 'Total Number of Packs',
  total_weight: 'Total Weight (kg)',
  volume_weight: 'Volume Weight (kg)',
  cargo_value: 'Total Cargo Value (USD)',
  hs_code: 'HS Code',
  origin_airport: 'Origin Airport',
  destination_airport: 'Destination Airport',
  origin_port: 'Origin Port',
  destination_port: 'Destination Port',
  preferred_date: 'Preferred Shipping Date',
  incoterm: 'Incoterm',
  container_type: 'Container Type',
  cargo_type: 'Cargo Type',
  total_volume: 'Total Volume (CBM)',
  item_description: 'Item Description',
  number_of_items: 'Number of Items',
  box_dimensions: 'Package Dimensions (L×W×H cm)',
  declared_value: 'Declared Value (USD)',
  urgency: 'Urgency Level',
  pickup_location: 'Pickup Location',
  delivery_location: 'Delivery Location',
  fair_name: 'Fair / Phase',
  visit_date: 'Planned Visit Date',
  visit_duration: 'Visit Duration (days)',
  number_of_attendees: 'Number of Attendees',
  assistance_type: 'Type of Assistance',
  language_preference: 'Language Preference',
  product_interest: 'Products of Interest',
  target_suppliers: 'Target Suppliers to Meet',
  hotel_preference: 'Hotel Preference',
  pickup_needed: 'Airport Pickup Needed?',
  sender_name: 'Sender Name',
  sender_phone: 'Sender Phone',
  sender_address: 'Sender Address / Pickup Location',
  supplier_tracking_code: 'Supplier Tracking Code',
  delivery_warehouse: 'Delivery Warehouse',
};

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [convertPrice, setConvertPrice] = useState('');
  const [convertShipping, setConvertShipping] = useState('air-cargo');
  const [converting, setConverting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter, pagination.page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('service_type', typeFilter);
      if (search) params.append('search', search);

      const response = await api.get(`/admin/service-requests?${params}`);
      setRequests(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/admin/service-requests/${id}`, { status });
      fetchRequests();
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Check if the transition is valid.');
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    try {
      await api.put(`/admin/service-requests/${selectedRequest.id}`, {
        admin_notes: adminNotes,
        price: parseFloat(priceInput) || 0,
      });
      fetchRequests();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save details:', error);
    } finally {
      setSaving(false);
    }
  };

  const openViewModal = async (request: ServiceRequest) => {
    try {
      const response = await api.get(`/admin/service-requests/${request.id}`);
      const fullRequest = response.data.data;
      setSelectedRequest(fullRequest);
      setAdminNotes(fullRequest.admin_notes || '');
      setPriceInput(fullRequest.price?.toString() || '');
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch request details:', error);
    }
  };

  const openConvertModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setConvertPrice('');
    setConvertShipping('air-cargo');
    setShowConvertModal(true);
  };

  const handleConvertToOrder = async () => {
    if (!selectedRequest) return;
    setConverting(true);
    try {
      await api.post(`/admin/service-requests/${selectedRequest.id}/convert-to-order`, {
        price: parseFloat(convertPrice) || 0,
        shipping_method: convertShipping,
      });
      setShowConvertModal(false);
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to convert to order:', error);
      alert('Failed to convert to order.');
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service request?')) return;
    try {
      await api.delete(`/admin/service-requests/${id}`);
      fetchRequests();
      if (selectedRequest?.id === id) setShowModal(false);
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-600">Manage customer service requests</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Status</option>
              <option value="received">Received</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Services</option>
              <option value="product_sourcing">Product Sourcing</option>
              <option value="wholesale_supply">Wholesale Supply</option>
              <option value="air_cargo">Air Cargo</option>
              <option value="sea_shipping">Sea Shipping</option>
              <option value="hand_carry">Hand Carry</option>
              <option value="canton_fair">Canton Fair</option>
            </select>
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, tracking..."
                className="flex-1"
              />
              <Button type="submit" size="sm">Search</Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No service requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tracking</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => {
                    const ServiceIcon = SERVICE_TYPE_ICONS[request.service_type] || FileText;
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ServiceIcon size={16} className="text-gray-400" />
                            <span className="text-sm font-medium">{SERVICE_TYPE_LABELS[request.service_type] || request.service_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{request.name}</td>
                        <td className="px-6 py-4 text-sm">{request.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-mono text-primary">{request.tracking_number || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded border-0 ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-800'}`}
                          >
                            <option value="received">Received</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(request.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!request.converted_order_id && request.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openConvertModal(request)}
                                className="text-green-600 hover:text-green-700"
                                title="Convert to Order"
                              >
                                <ArrowRight size={16} />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => openViewModal(request)}>
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(request.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service Request Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-medium">{SERVICE_TYPE_LABELS[selectedRequest.service_type] || selectedRequest.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[selectedRequest.status] || ''}`}>
                    {STATUS_LABELS[selectedRequest.status] || selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{selectedRequest.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <p className="font-medium">{selectedRequest.whatsapp || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{selectedRequest.company || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-mono font-medium text-primary">{selectedRequest.tracking_number || '-'}</p>
                </div>
              </div>

              {/* Service-specific details - FULL DISPLAY */}
              {selectedRequest.details && (() => {
                let parsedDetails: Record<string, string>;
                try {
                  parsedDetails = typeof selectedRequest.details === 'string'
                    ? JSON.parse(selectedRequest.details)
                    : selectedRequest.details;
                } catch (e) {
                  return null;
                }

                const detailEntries = Object.entries(parsedDetails);
                if (detailEntries.length === 0) return null;

                return (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-primary" />
                      Service Request Details ({detailEntries.length} fields)
                    </h4>
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 sm:p-5 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {detailEntries.map(([key, value]) => {
                          const strValue = String(value ?? '');
                          return (
                          <div key={key} className={`bg-white rounded-lg p-3 border border-gray-100 ${key === 'specifications' || key === 'cargo_description' || key === 'item_description' ? 'md:col-span-2' : ''}`}>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              {DETAIL_LABELS[key] || key.replace(/_/g, ' ')}
                            </p>
                            {(key === 'product_link') ? (
                              <a
                                href={strValue}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                              >
                                {strValue.length > 50 ? strValue.substring(0, 50) + '...' : strValue}
                                <ExternalLink size={12} />
                              </a>
                            ) : (key === 'specifications' || key === 'cargo_description' || key === 'item_description' || key === 'message') ? (
                              <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded p-2 mt-1">{strValue}</p>
                            ) : (
                              <p className="text-sm font-medium text-gray-900 break-all">{strValue || '-'}</p>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {selectedRequest.message && (
                <div>
                  <p className="text-sm text-gray-600">Message</p>
                  <p className="font-medium bg-gray-50 p-3 rounded">{selectedRequest.message}</p>
                </div>
              )}

              {/* Admin fields */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-gray-900">Admin Actions</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this request..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (BDT)</label>
                  <Input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Enter quoted price"
                  />
                </div>
                <Button onClick={handleSaveDetails} disabled={saving} className="w-full">
                  <Save className="mr-2" size={16} />
                  {saving ? 'Saving...' : 'Save Notes & Price'}
                </Button>
              </div>

              {/* Convert to order */}
              {!selectedRequest.converted_order_id && selectedRequest.status !== 'cancelled' && (
                <div className="border-t pt-4">
                  <Button
                    onClick={() => { setShowModal(false); openConvertModal(selectedRequest); }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    Convert to Order
                  </Button>
                </div>
              )}

              {selectedRequest.converted_order_id && (
                <div className="border-t pt-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <CheckCircle className="text-green-500 mx-auto mb-2" size={24} />
                    <p className="text-sm font-medium text-green-800">This request has been converted to an order</p>
                  </div>
                </div>
              )}

              {/* Tracking history */}
              {(selectedRequest as ServiceRequest & { tracking?: Array<{ status: string; location?: string; note?: string; created_at: string }> }).tracking && (selectedRequest as ServiceRequest & { tracking?: Array<{ status: string; location?: string; note?: string; created_at: string }> }).tracking!.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Tracking History</h4>
                  <div className="space-y-3">
                    {(selectedRequest as ServiceRequest & { tracking?: Array<{ status: string; location?: string; note?: string; created_at: string }> }).tracking!.map((entry, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium capitalize">{entry.status.replace(/_/g, ' ')}</p>
                          {entry.note && <p className="text-gray-600">{entry.note}</p>}
                          <p className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Convert to Order Modal */}
      {showConvertModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Convert to Order
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowConvertModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Service Request:</p>
                <p className="font-medium">{SERVICE_TYPE_LABELS[selectedRequest.service_type]}</p>
                <p className="text-sm text-gray-500">by {selectedRequest.name} ({selectedRequest.email})</p>
                <p className="text-xs text-primary mt-1">Tracking: {selectedRequest.tracking_number}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (BDT)</label>
                <Input
                  type="number"
                  value={convertPrice}
                  onChange={(e) => setConvertPrice(e.target.value)}
                  placeholder="Enter order price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Shipping Method</label>
                <select
                  value={convertShipping}
                  onChange={(e) => setConvertShipping(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="air-cargo">Air Cargo</option>
                  <option value="sea-shipping">Sea Shipping</option>
                  <option value="hand-carry">Hand Carry</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowConvertModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleConvertToOrder}
                  disabled={converting}
                >
                  {converting ? 'Converting...' : 'Confirm & Create Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
