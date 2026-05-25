'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FileText, Eye, Trash2, X, ExternalLink, Save, ArrowRight, CheckCircle, Pencil, Download } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { ProductRequest } from '@/types';
import { useToast, errorMessage } from '@/components/ui/Toast';

const DETAIL_LABELS: Record<string, string> = {
  product_name: 'Product Name',
  product_link: 'Product Link / Reference',
  target_price: 'Target Price (৳ BDT)',
  quantity: 'Quantity',
  sample_needed: 'Sample Needed?',
  shipping_method: 'Shipping Method',
};

export default function AdminRequestsPage() {
  const toast = useToast();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
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
      toast.error(`Failed to load requests: ${errorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/admin/requests/${id}`, { status });
      fetchRequests();
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update request:', error);
      toast.error(`Status update failed: ${errorMessage(error)}`);
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
      toast.success('Tracking number saved');
    } catch (error) {
      console.error('Failed to update tracking number:', error);
      toast.error(`Tracking update failed: ${errorMessage(error)}`);
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
      toast.success('Request converted to order');
    } catch (error) {
      console.error('Failed to convert to order:', error);
      toast.error(`Convert failed: ${errorMessage(error)}`);
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await api.delete(`/admin/requests/${id}`);
      fetchRequests();
      toast.success('Request moved to trash');
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error(`Delete failed: ${errorMessage(error)}`);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    }
  };

  const downloadAllImages = async (imageString: string, requestId: string) => {
    let imageUrls: string[] = [];
    try {
      const parsed = JSON.parse(imageString);
      imageUrls = Array.isArray(parsed) ? parsed : [imageString];
    } catch {
      imageUrls = [imageString];
    }
    
    const validUrls = imageUrls.filter(u => u);
    if (validUrls.length === 0) {
      toast.error('No images to download');
      return;
    }

    // Download each image sequentially
    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      const src = url.startsWith('http') ? url : `http://localhost:5000${url}`;
      const filename = `product-image-${requestId}-${i + 1}.jpg`;
      await downloadImage(src, filename);
      // Small delay between downloads to avoid browser blocking
      if (i < validUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    toast.success(`Downloaded ${validUrls.length} image(s)`);
  };

  const openViewModal = async (request: ProductRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const openEditModal = (request: ProductRequest) => {
    setSelectedRequest(request);
    setEditFormData({
      name: request.name || '',
      phone: request.phone || '',
      whatsapp: request.whatsapp || '',
      email: request.email || '',
      company: request.company || '',
      product_name: request.product_name || '',
      product_link: request.product_link || '',
      target_price: request.target_price || '',
      quantity: request.quantity || '',
      sample_needed: request.sample_needed || '',
      shipping_method: request.shipping_method || '',
      specifications: request.specifications || '',
      message: request.message || '',
      status: request.status || '',
      tracking_number: request.tracking_number || '',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    try {
      await api.put(`/admin/requests/${selectedRequest.id}`, editFormData);
      setShowEditModal(false);
      fetchRequests();
      toast.success('Request updated successfully');
    } catch (error) {
      console.error('Failed to update request:', error);
      toast.error(`Update failed: ${errorMessage(error)}`);
    } finally {
      setSaving(false);
    }
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
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Tracking</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Date</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium">{request.name}</td>
                      <td className="px-3 py-2 text-sm hidden md:table-cell">{request.email}</td>
                      <td className="px-3 py-2 text-sm">{request.product_name}</td>
                      <td className="px-3 py-2 text-sm hidden md:table-cell">
                        <span className="font-mono text-primary">{request.tracking_number || '-'}</span>
                      </td>
                      <td className="px-3 py-2">
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
                      <td className="px-3 py-2 text-sm text-gray-500 hidden md:table-cell">{formatDate(request.created_at)}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
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
                            onClick={() => openEditModal(request)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Pencil size={16} />
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
            <CardContent className="space-y-5">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-sm">{selectedRequest.name}</p></div>
                  <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-sm">{selectedRequest.email}</p></div>
                  {selectedRequest.phone && <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-sm">{selectedRequest.phone}</p></div>}
                  {selectedRequest.whatsapp && <div><p className="text-xs text-gray-500">WhatsApp</p><p className="font-medium text-sm">{selectedRequest.whatsapp}</p></div>}
                  {selectedRequest.company && <div className="col-span-2"><p className="text-xs text-gray-500">Company</p><p className="font-medium text-sm">{selectedRequest.company}</p></div>}
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-primary" /> Product Details
                </h4>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-100 md:col-span-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Product Name</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedRequest.product_name}</p>
                    </div>
                    {selectedRequest.product_link && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100 md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Product Link</p>
                        <a href={selectedRequest.product_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all flex items-center gap-1">
                          {selectedRequest.product_link.length > 80 ? selectedRequest.product_link.substring(0, 80) + '...' : selectedRequest.product_link}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                    {Object.entries(DETAIL_LABELS).filter(([k]) => k !== 'product_name' && k !== 'product_link').map(([key, label]) => {
                      const value = (selectedRequest as any)[key];
                      if (!value) return null;
                      return (
                        <div key={key} className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                          <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                        </div>
                      );
                    })}
                    {selectedRequest.specifications && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100 md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Specifications</p>
                        <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{selectedRequest.specifications}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedRequest.message && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Message</h4>
                  <p className="bg-gray-50 p-3 rounded-lg text-sm">{selectedRequest.message}</p>
                </div>
              )}

              {/* Product Images */}
              {selectedRequest.image && (() => {
                let imageUrls: string[] = [];
                try {
                  const parsed = JSON.parse(selectedRequest.image);
                  imageUrls = Array.isArray(parsed) ? parsed : [selectedRequest.image];
                } catch {
                  imageUrls = [selectedRequest.image];
                }
                const validUrls = imageUrls.filter(u => u);
                return validUrls.length > 0 ? (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Product Images ({validUrls.length})</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadAllImages(selectedRequest.image!, selectedRequest.id)}
                        className="text-xs flex items-center gap-1"
                      >
                        <Download size={14} />
                        Download All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {validUrls.map((url, i) => {
                        const src = url.startsWith('http') ? url : `http://localhost:5000${url}`;
                        return (
                          <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                            <img src={src} alt={`Image ${i + 1}`} className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity cursor-pointer" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Admin Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Admin</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                    {editingTracking === selectedRequest.id ? (
                      <div className="flex gap-2">
                        <Input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="Enter tracking number" className="flex-1" />
                        <Button size="sm" onClick={() => handleTrackingUpdate(selectedRequest.id)}><Save size={16} /></Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingTracking(null)}><X size={16} /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-primary text-sm">{selectedRequest.tracking_number || 'Not set'}</span>
                        <Button size="sm" variant="ghost" onClick={() => startEditingTracking(selectedRequest)}>Edit</Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium text-sm">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>
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

      {/* Edit Modal */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Request</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <Input value={editFormData.name || ''} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    <Input value={editFormData.phone || ''} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">WhatsApp</label>
                    <Input value={editFormData.whatsapp || ''} onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <Input value={editFormData.email || ''} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Company</label>
                    <Input value={editFormData.company || ''} onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Product Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">{DETAIL_LABELS.product_name}</label>
                    <Input value={editFormData.product_name || ''} onChange={(e) => setEditFormData({ ...editFormData, product_name: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">{DETAIL_LABELS.product_link}</label>
                    <Input value={editFormData.product_link || ''} onChange={(e) => setEditFormData({ ...editFormData, product_link: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{DETAIL_LABELS.target_price}</label>
                    <Input value={editFormData.target_price || ''} onChange={(e) => setEditFormData({ ...editFormData, target_price: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{DETAIL_LABELS.quantity}</label>
                    <Input value={editFormData.quantity || ''} onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{DETAIL_LABELS.sample_needed}</label>
                    <select
                      value={editFormData.sample_needed || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, sample_needed: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">Not specified</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{DETAIL_LABELS.shipping_method}</label>
                    <Input value={editFormData.shipping_method || ''} onChange={(e) => setEditFormData({ ...editFormData, shipping_method: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Specifications</label>
                    <Textarea value={editFormData.specifications || ''} onChange={(e) => setEditFormData({ ...editFormData, specifications: e.target.value })} rows={3} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Message</label>
                    <Textarea value={editFormData.message || ''} onChange={(e) => setEditFormData({ ...editFormData, message: e.target.value })} rows={3} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Admin</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select
                      value={editFormData.status || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="converted">Converted</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tracking Number</label>
                    <Input value={editFormData.tracking_number || ''} onChange={(e) => setEditFormData({ ...editFormData, tracking_number: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleEditSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
