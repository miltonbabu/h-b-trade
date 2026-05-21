'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Eye, Trash2, X, ExternalLink, Save, ArrowRight, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { ProductRequest } from '@/types';

const DETAIL_LABELS: Record<string, string> = {
  product_name: 'Product Name',
  product_link: 'Product Link / Reference',
  target_price: 'Target Price (USD)',
  quantity: 'Quantity',
  packaging_type: 'Packaging Type',
  pack_quantity: 'Qty per Pack / Inner Unit',
  master_pack_quantity: 'Qty per Master Pack / Outer Unit',
  pack_dimensions: 'Pack Dimensions (L×W×H cm)',
  weight_per_pack: 'Weight per Master Pack (kg)',
  sample_needed: 'Sample Needed?',
  shipping_method: 'Shipping Method',
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [convertPrice, setConvertPrice] = useState('');
  const [convertStatus, setConvertStatus] = useState('processing');
  const [converting, setConverting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, pagination.page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/admin/requests?${params}`);
      setRequests(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/admin/requests/${id}`, { status });
      fetchRequests();
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  const handleTrackingUpdate = async (id: string) => {
    try {
      await api.put(`/admin/requests/${id}`, { tracking_number: trackingInput });
      setEditingTracking(null);
      setTrackingInput('');
      fetchRequests();
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, tracking_number: trackingInput });
      }
    } catch (error) {
      console.error('Failed to update tracking number:', error);
    }
  };

  const startEditingTracking = (request: ProductRequest) => {
    setEditingTracking(request.id);
    setTrackingInput(request.tracking_number || '');
  };

  const openConvertModal = (request: ProductRequest) => {
    setSelectedRequest(request);
    setConvertPrice('');
    setConvertStatus('processing');
    setShowConvertModal(true);
  };

  const handleConvertToOrder = async () => {
    if (!selectedRequest) return;
    setConverting(true);
    try {
      await api.post(`/admin/requests/${selectedRequest.id}/convert-to-order`, {
        price: parseFloat(convertPrice) || 0,
        status: convertStatus
      });
      setShowConvertModal(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to convert to order:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await api.delete(`/admin/requests/${id}`);
      fetchRequests();
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  };

  const openViewModal = async (request: ProductRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Requests</h1>
          <p className="text-gray-600">Manage customer product requests</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="converted">Converted to Order</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
              <p className="text-gray-500">No product requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tracking</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{request.name}</td>
                      <td className="px-6 py-4 text-sm">{request.email}</td>
                      <td className="px-6 py-4 text-sm">{request.product_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-mono text-primary">{request.tracking_number || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusChange(request.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded border-0 ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'completed' ? 'bg-green-100 text-green-800' :
                            request.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="converted">Converted</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(request.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {request.status !== 'converted' && (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(request)}
                          >
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Request Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium">{selectedRequest.product_name}</p>
                </div>
                {selectedRequest.product_link && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Product Link</p>
                    <a 
                      href={selectedRequest.product_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {selectedRequest.product_link}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{selectedRequest.quantity || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shipping Method</p>
                  <p className="font-medium">{selectedRequest.shipping_method || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                  {editingTracking === selectedRequest.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="Enter tracking number"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleTrackingUpdate(selectedRequest.id)}>
                        <Save size={16} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingTracking(null)}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-primary">
                        {selectedRequest.tracking_number || 'Not set'}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => startEditingTracking(selectedRequest)}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
                </div>
                {selectedRequest.message && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Message</p>
                    <p className="font-medium bg-gray-50 p-3 rounded">{selectedRequest.message}</p>
                  </div>
                )}

                {/* Full Product Details Section */}
                <div className="col-span-2 border-t pt-4 mt-2">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    Complete Request Details
                  </h4>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(DETAIL_LABELS).map(([key, label]) => {
                        const rawValue = (selectedRequest as any)[key];
                        if (!rawValue) return null;
                        const strValue = String(rawValue);
                        return (
                          <div key={key} className={`bg-white rounded-lg p-3 border border-gray-100 ${key === 'product_link' || key === 'message' ? 'md:col-span-2' : ''}`}>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                            {key === 'product_link' ? (
                              <a href={strValue} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all flex items-center gap-1">
                                {strValue.length > 60 ? strValue.substring(0, 60) + '...' : strValue}
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <p className="text-sm font-medium text-gray-900 break-all">{strValue}</p>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Show any extra fields not in our label map */}
                      {['specifications', 'details'].map(extraField => {
                        const value = (selectedRequest as any)[extraField];
                        if (!value) return null;
                        let parsedValue;
                        try { parsedValue = typeof value === 'string' ? JSON.parse(value) : value; } catch { parsedValue = value; }
                        
                        if (typeof parsedValue === 'object') {
                          return (
                            <div key={extraField} className="md:col-span-2 bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Additional Details</p>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {Object.entries(parsedValue as Record<string, unknown>).map(([k, v]) => (
                                  <div key={k} className="bg-gray-50 rounded p-2">
                                    <span className="text-xs text-gray-500">{DETAIL_LABELS[k] || k.replace(/_/g, ' ')}</span>
                                    <p className="text-sm font-medium text-gray-900">{String(v ?? '')}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={extraField} className="md:col-span-2 bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Additional Info</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded p-2 mt-1">{String(parsedValue)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {selectedRequest.image && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Product Image</p>
                    <img 
                      src={`http://localhost:5000${selectedRequest.image}`} 
                      alt="Product" 
                      className="max-w-full h-auto rounded border"
                    />
                  </div>
                )}
              </div>
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
                <p className="text-sm text-gray-600">Request Details:</p>
                <p className="font-medium">{selectedRequest.product_name}</p>
                <p className="text-sm text-gray-500">by {selectedRequest.name}</p>
                {selectedRequest.tracking_number && (
                  <p className="text-xs text-primary mt-1">Tracking: {selectedRequest.tracking_number}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price (BDT)</label>
                <Input
                  type="number"
                  value={convertPrice}
                  onChange={(e) => setConvertPrice(e.target.value)}
                  placeholder="Enter price"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Initial Status</label>
                <select
                  value={convertStatus}
                  onChange={(e) => setConvertStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
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
