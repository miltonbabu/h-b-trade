'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Package, Plus, Search, Edit, Trash2, X, Eye, Download, FileText, FileDown } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Order } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    product_name: '',
    quantity: '',
    shipping_method: '',
    price: '',
    status: 'pending',
    tracking_number: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await api.get(`/admin/orders?${params}`);
      setOrders(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/orders', formData);
      setShowModal(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    try {
      await api.put(`/admin/orders/${selectedOrder.id}`, formData);
      setShowModal(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedOrder(null);
    setShowModal(true);
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      customer_name: order.customer_name,
      product_name: order.product_name,
      quantity: order.quantity || '',
      shipping_method: order.shipping_method || '',
      price: order.price?.toString() || '',
      status: order.status,
      tracking_number: order.tracking_number || '',
    });
    setShowModal(true);
  };

  const openViewModal = async (order: Order) => {
    try {
      const response = await api.get(`/admin/orders/${order.id}`);
      setSelectedOrder(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      product_name: '',
      quantity: '',
      shipping_method: '',
      price: '',
      status: 'pending',
      tracking_number: '',
    });
  };

  // Download as PDF
  const downloadAsPDF = (order: Order) => {
    const printContent = generateOrderHTML(order);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Download as DOC (HTML format)
  const downloadAsDoc = (order: Order) => {
    const content = generateOrderHTML(order);
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${order.order_number}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate HTML content for order
  const generateOrderHTML = (order: Order): string => {
    const customerInfo = order.customer_info 
      ? (typeof order.customer_info === 'string' ? JSON.parse(order.customer_info) : order.customer_info)
      : null;
    
    const itemsInfo = order.items_info
      ? (typeof order.items_info === 'string' ? JSON.parse(order.items_info) : order.items_info)
      : null;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #0d9488; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #0d9488; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .field { margin-bottom: 10px; }
          .label { font-size: 12px; color: #6b7280; }
          .value { font-size: 14px; font-weight: 500; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-processing { background: #dbeafe; color: #1e40af; }
          .status-shipped { background: #e0e7ff; color: #3730a3; }
          .status-in-transit { background: #cffafe; color: #0e7490; }
          .status-delivered { background: #d1fae5; color: #065f46; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .items-table th, .items-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
          .items-table th { background: #f9fafb; font-weight: 600; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; color: #0d9488; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">H&B Trade</div>
          <p style="color: #6b7280; margin: 5px 0;">China to Bangladesh Product Sourcing & Shipping</p>
        </div>

        <div class="section">
          <div class="section-title">Order Information</div>
          <div class="grid">
            <div class="field">
              <div class="label">Order Number</div>
              <div class="value">${order.order_number}</div>
            </div>
            <div class="field">
              <div class="label">Tracking Number</div>
              <div class="value">${order.tracking_number || 'Not assigned'}</div>
            </div>
            <div class="field">
              <div class="label">Status</div>
              <div class="value"><span class="status status-${order.status}">${order.status.toUpperCase()}</span></div>
            </div>
            <div class="field">
              <div class="label">Order Date</div>
              <div class="value">${formatDate(order.created_at)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="grid">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${order.customer_name}</div>
            </div>
            ${customerInfo?.email ? `<div class="field"><div class="label">Email</div><div class="value">${customerInfo.email}</div></div>` : ''}
            ${customerInfo?.phone ? `<div class="field"><div class="label">Phone</div><div class="value">${customerInfo.phone}</div></div>` : ''}
            ${customerInfo?.whatsapp ? `<div class="field"><div class="label">WhatsApp</div><div class="value">${customerInfo.whatsapp}</div></div>` : ''}
            ${customerInfo?.address ? `<div class="field" style="grid-column: span 2;"><div class="label">Address</div><div class="value">${customerInfo.address}</div></div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Product Details</div>
          ${itemsInfo && itemsInfo.length > 0 ? `
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Unit Price</th>
                  <th>MOQ</th>
                  <th>Batches</th>
                  <th>Total Units</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsInfo.map((item: any) => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.productCode || '-'}</td>
                    <td>৳${(item.unitPrice || item.price || 0).toFixed(2)}</td>
                    <td>${item.moq || 1}</td>
                    <td>${item.quantity}</td>
                    <td>${item.totalUnits || (item.moq || 1) * item.quantity}</td>
                    <td>৳${(item.totalPrice || item.total || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="margin-top: 10px; text-align: right;">
              <strong>Total Units: ${itemsInfo.reduce((sum: number, item: any) => sum + (item.totalUnits || (item.moq || 1) * item.quantity), 0)}</strong>
            </div>
          ` : `
            <div class="grid">
              <div class="field" style="grid-column: span 2;">
                <div class="label">Product(s)</div>
                <div class="value">${order.product_name}</div>
              </div>
              <div class="field">
                <div class="label">Quantity</div>
                <div class="value">${order.quantity || '-'}</div>
              </div>
            </div>
          `}
        </div>

        <div class="section">
          <div class="section-title">Shipping & Payment</div>
          <div class="grid">
            <div class="field">
              <div class="label">Shipping Method</div>
              <div class="value">${order.shipping_method || 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="label">Total Amount</div>
              <div class="value" style="color: #0d9488; font-size: 18px;">৳${order.price || '0'}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>H&B Trade - Your Trusted Sourcing Partner</p>
          <p style="margin-top: 10px;">Document generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and shipments</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2" size={20} />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
              <Button type="submit" variant="outline">
                <Search size={20} />
              </Button>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Shipping</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tracking</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{order.order_number}</td>
                      <td className="px-6 py-4">{order.customer_name}</td>
                      <td className="px-6 py-4">{order.product_name}</td>
                      <td className="px-6 py-4">
                        {order.shipping_method ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {order.shipping_method}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{order.tracking_number || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(order)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(order)}
                          >
                            <Edit size={16} />
                          </Button>
                          {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}')?.role === 'super_admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(order.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{selectedOrder ? 'Edit Order' : 'New Order'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <Input
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Method</label>
                <select
                  value={formData.shipping_method}
                  onChange={(e) => setFormData({ ...formData, shipping_method: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select method</option>
                  <option value="air-cargo">Air Cargo</option>
                  <option value="sea-shipping">Sea Shipping</option>
                  <option value="hand-carry">Hand Carry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                <Input
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={selectedOrder ? handleUpdate : handleCreate}>
                  {selectedOrder ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-medium">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-medium text-blue-600">{selectedOrder.tracking_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              {selectedOrder.customer_info && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                    </div>
                    {(() => {
                      try {
                        const customerInfo = typeof selectedOrder.customer_info === 'string'
                          ? JSON.parse(selectedOrder.customer_info)
                          : selectedOrder.customer_info;
                        return (
                          <>
                            {customerInfo.email && (
                              <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">{customerInfo.email}</p>
                              </div>
                            )}
                            {customerInfo.phone && (
                              <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium">{customerInfo.phone}</p>
                              </div>
                            )}
                            {customerInfo.whatsapp && (
                              <div>
                                <p className="text-sm text-gray-600">WhatsApp</p>
                                <p className="font-medium">{customerInfo.whatsapp}</p>
                              </div>
                            )}
                            {customerInfo.address && (
                              <div className="col-span-2">
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="font-medium">{customerInfo.address}</p>
                              </div>
                            )}
                          </>
                        );
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Product Info */}
              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">Product Information</h3>
                <div className="space-y-4">
                  {/* Product Codes - Only visible to admin */}
                  {selectedOrder.product_codes && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                      <p className="text-sm font-bold text-yellow-800 mb-2">🔑 Product Codes (Admin Only)</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrder.product_codes.split(', ').map((code, index) => (
                          <span key={index} className="px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full text-sm font-mono font-bold">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items Details */}
                  {selectedOrder.items_info && (() => {
                    try {
                      const items = typeof selectedOrder.items_info === 'string'
                        ? JSON.parse(selectedOrder.items_info)
                        : selectedOrder.items_info;
                      return (
                        <div className="space-y-2">
                          {items.map((item: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{item.productName}</p>
                                  {item.productCode && (
                                    <p className="text-xs text-gray-500 mt-1">Code: <span className="font-mono font-bold text-blue-600">{item.productCode}</span></p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600">৳{(item.totalPrice || item.total || 0).toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Unit Price:</span>
                                  <span className="font-medium ml-1">৳{(item.unitPrice || item.price || 0).toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">MOQ:</span>
                                  <span className="font-medium ml-1">{item.moq || 1}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Batches:</span>
                                  <span className="font-medium ml-1">{item.quantity}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Total Units:</span>
                                  <span className="font-bold text-orange-600 ml-1">{item.totalUnits || (item.moq || 1) * item.quantity}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Total Units:</span>
                              <span className="font-bold text-orange-600">
                                {items.reduce((sum: number, item: any) => sum + (item.totalUnits || (item.moq || 1) * item.quantity), 0)} units
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}

                  {/* Fallback for orders without items_info */}
                  {!selectedOrder.items_info && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Product(s)</p>
                        <p className="font-medium">{selectedOrder.product_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{selectedOrder.quantity || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium text-lg text-green-600">{selectedOrder.price ? `৳${selectedOrder.price}` : '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Shipping Method</p>
                    <p className="font-medium">
                      {selectedOrder.shipping_method ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {selectedOrder.shipping_method}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedOrder.payment_info && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">Payment Information</h3>
                  {(() => {
                    try {
                      const paymentInfo = typeof selectedOrder.payment_info === 'string'
                        ? JSON.parse(selectedOrder.payment_info)
                        : selectedOrder.payment_info;
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Payment Option</p>
                            <p className="font-medium">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                paymentInfo.option === 'now' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {paymentInfo.option === 'now' ? 'Pay Now' : 'Pay Later'}
                              </span>
                            </p>
                          </div>
                          {paymentInfo.option === 'now' && (
                            <>
                              <div>
                                <p className="text-sm text-gray-600">Payment Method</p>
                                <p className="font-medium capitalize">{paymentInfo.method || '-'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Transaction ID</p>
                                <p className="font-medium">{paymentInfo.transactionId || '-'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Amount Paid</p>
                                <p className="font-medium text-green-600">৳{paymentInfo.amount || '-'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>
              )}

              <div className="pt-4">
                <div className="flex gap-2 mb-3">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => downloadAsPDF(selectedOrder)}
                  >
                    <FileDown size={16} className="mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => downloadAsDoc(selectedOrder)}
                  >
                    <FileText size={16} className="mr-2" />
                    Download DOC
                  </Button>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
