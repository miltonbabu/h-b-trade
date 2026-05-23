'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  FileText,
  Search,
  Download,
  Mail,
  Upload,
  Image as ImageIcon,
  Eye,
  Plus,
  Minus,
  CheckCircle,
  X,
  Package,
  ClipboardList,
  Wrench,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Order, ProductRequest, ServiceRequest, InvoiceData, InvoiceItem } from '@/types';
import { pdf } from '@react-pdf/renderer';

const InvoicePDF = dynamic(
  () => import('@/components/invoice/InvoicePDF'),
  { ssr: false }
);

const LOGO_URL = '/hbtrade_logo.png';

type SourceType = 'order' | 'request' | 'service-request' | 'custom';

interface SourceItem {
  id: string;
  number: string;
  customerName: string;
  productName: string;
  status: string;
  date: string;
  amount: number;
  raw: any;
}

export default function AdminInvoicesPage() {
  const [items, setItems] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('order');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [signatureFile, setSignatureFile] = useState<string | null>(null);
  const [useLogoSignature, setUseLogoSignature] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sourceType !== 'custom') {
      setPage(1);
    }
  }, [sourceType]);

  useEffect(() => {
    if (sourceType !== 'custom') {
      fetchData();
    }
  }, [sourceType, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const limit = 20;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (sourceType === 'order') {
        if (search) params.append('search', search);
        const res = await api.get(`/admin/orders?${params}`);
        const raw: Order[] = res.data.data || [];
        setItems(raw.map((o) => ({
          id: o.id,
          number: o.order_number,
          customerName: o.customer_name,
          productName: o.product_name,
          status: o.status,
          date: o.created_at,
          amount: o.total_amount || o.price || 0,
          raw: o,
        })));
        if (res.data.pagination) {
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.pages);
        }
      } else if (sourceType === 'request') {
        if (search) params.append('search', search);
        const res = await api.get(`/admin/requests?${params}`);
        const raw: ProductRequest[] = res.data.data || [];
        setItems(raw.map((r) => ({
          id: r.id,
          number: `REQ-${r.id.slice(0, 8).toUpperCase()}`,
          customerName: r.name,
          productName: r.product_name,
          status: r.status,
          date: r.created_at,
          amount: r.target_price ? parseFloat(r.target_price) : 0,
          raw: r,
        })));
        if (res.data.pagination) {
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.pages);
        }
      } else {
        if (search) params.append('search', search);
        const res = await api.get(`/admin/service-requests?${params}`);
        const raw: ServiceRequest[] = res.data.data || [];
        setItems(raw.map((r) => ({
          id: r.id,
          number: `SR-${r.id.slice(0, 8).toUpperCase()}`,
          customerName: r.name,
          productName: r.service_type || 'Service Request',
          status: r.status,
          date: r.created_at,
          amount: r.price || 0,
          raw: r,
        })));
        if (res.data.pagination) {
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.pages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const buildInvoiceFromOrder = (order: Order): InvoiceData => {
    const customerInfo = order.customer_info
      ? typeof order.customer_info === 'string'
        ? JSON.parse(order.customer_info)
        : order.customer_info
      : {};

    const itemsInfo = order.items_info
      ? typeof order.items_info === 'string'
        ? JSON.parse(order.items_info)
        : order.items_info
      : null;

    const invoiceItems: InvoiceItem[] = itemsInfo && Array.isArray(itemsInfo) && itemsInfo.length > 0
      ? itemsInfo.map((item: any) => ({
          productName: item.productName || order.product_name,
          productCode: item.productCode || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || item.price || 0,
          perPiecePrice: item.perPiecePrice || undefined,
          weight: item.weight || '',
          volume: item.volume || '',
          total: item.totalPrice || item.total || 0,
        }))
      : [{
          productName: order.product_name,
          productCode: order.product_codes || '',
          quantity: parseInt(order.quantity || '1'),
          unitPrice: order.price ? order.price / parseInt(order.quantity || '1') : 0,
          perPiecePrice: undefined,
          weight: order.net_weight || '',
          volume: '',
          total: order.price || order.total_amount || 0,
        }];

    const subtotal = invoiceItems.reduce((sum, i) => sum + i.total, 0);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    return {
      invoiceNumber: `INV-${order.order_number}`,
      invoiceDate: new Date().toISOString(),
      orderDate: order.created_at,
      dueDate: dueDate.toISOString(),
      orderNumber: order.order_number,
      trackingNumber: order.tracking_number || '',
      status: order.status,
      shippingMethod: order.shipping_method || '',
      customerName: customerInfo.name || order.customer_name,
      customerEmail: customerInfo.email || '',
      customerPhone: customerInfo.phone || '',
      customerWhatsapp: customerInfo.whatsapp || '',
      customerAddress: customerInfo.address || '',
      deliveryAddress: customerInfo.address || '',
      items: invoiceItems,
      subtotal,
      shippingCost: 0,
      discount: 0,
      totalAmount: order.total_amount || order.price || subtotal,
      netWeight: order.net_weight || '',
      paymentInfo: order.payment_info || '',
      notes: '',
      signatureUrl: signatureFile || undefined,
      useLogoAsSignature: useLogoSignature,
    };
  };

  const buildInvoiceFromRequest = (req: ProductRequest): InvoiceData => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const price = req.target_price ? parseFloat(req.target_price) : 0;
    const qty = req.quantity ? parseInt(req.quantity) : 1;
    const subtotal = price * qty;

    return {
      invoiceNumber: `INV-REQ-${req.id.slice(0, 8).toUpperCase()}`,
      invoiceDate: new Date().toISOString(),
      orderDate: req.created_at,
      dueDate: dueDate.toISOString(),
      orderNumber: `REQ-${req.id.slice(0, 8).toUpperCase()}`,
      status: req.status,
      shippingMethod: req.shipping_method || '',
      customerName: req.name,
      customerEmail: req.email,
      customerPhone: req.phone || '',
      customerWhatsapp: req.whatsapp || '',
      customerAddress: '',
      deliveryAddress: '',
      items: [{
        productName: req.product_name,
        productCode: '',
        quantity: qty,
        unitPrice: price,
        perPiecePrice: price,
        weight: req.weight_per_pack || '',
        volume: '',
        total: subtotal,
      }],
      subtotal,
      shippingCost: 0,
      discount: 0,
      totalAmount: subtotal,
      notes: req.message || '',
      signatureUrl: signatureFile || undefined,
      useLogoAsSignature: useLogoSignature,
    };
  };

  const buildInvoiceFromServiceRequest = (req: ServiceRequest): InvoiceData => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const price = req.price || 0;
    const subtotal = price;

    return {
      invoiceNumber: `INV-SR-${req.id.slice(0, 8).toUpperCase()}`,
      invoiceDate: new Date().toISOString(),
      orderDate: req.created_at,
      dueDate: dueDate.toISOString(),
      orderNumber: `SR-${req.id.slice(0, 8).toUpperCase()}`,
      trackingNumber: req.tracking_number || '',
      status: req.status,
      customerName: req.name,
      customerEmail: req.email,
      customerPhone: req.phone || '',
      customerWhatsapp: req.whatsapp || '',
      customerAddress: '',
      deliveryAddress: '',
      items: [{
        productName: `${req.service_type || 'Service'} - ${req.company || req.name}`,
        productCode: '',
        quantity: 1,
        unitPrice: price,
        perPiecePrice: price,
        weight: '',
        volume: '',
        total: subtotal,
      }],
      subtotal,
      shippingCost: 0,
      discount: 0,
      totalAmount: subtotal,
      notes: req.message || req.details || '',
      signatureUrl: signatureFile || undefined,
      useLogoAsSignature: useLogoSignature,
    };
  };

  const handleSelectItem = (item: SourceItem) => {
    let data: InvoiceData;
    if (sourceType === 'order') {
      data = buildInvoiceFromOrder(item.raw as Order);
    } else if (sourceType === 'request') {
      data = buildInvoiceFromRequest(item.raw as ProductRequest);
    } else {
      data = buildInvoiceFromServiceRequest(item.raw as ServiceRequest);
    }
    setInvoiceData(data);
    setShowEditor(true);
    setShowPreview(false);
  };

  const handleCreateCustomInvoice = () => {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const customNum = `INV-CUSTOM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    setInvoiceData({
      invoiceNumber: customNum,
      invoiceDate: now.toISOString(),
      orderDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      orderNumber: customNum,
      trackingNumber: '',
      status: 'custom',
      shippingMethod: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerWhatsapp: '',
      customerAddress: '',
      deliveryAddress: '',
      items: [{ productName: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      shippingCost: 0,
      discount: 0,
      totalAmount: 0,
      netWeight: '',
      paymentInfo: '',
      notes: '',
      signatureUrl: undefined,
      useLogoAsSignature: false,
    });
    setSourceType('custom');
    setSignatureFile(null);
    setUseLogoSignature(false);
    setShowEditor(true);
    setShowPreview(false);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureFile(reader.result as string);
      setUseLogoSignature(false);
      if (invoiceData) {
        setInvoiceData({ ...invoiceData, signatureUrl: reader.result as string, useLogoAsSignature: false });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoSignature = () => {
    setUseLogoSignature(true);
    setSignatureFile(null);
    if (invoiceData) {
      setInvoiceData({ ...invoiceData, useLogoAsSignature: true, signatureUrl: undefined });
    }
  };

  const updateInvoiceField = (field: keyof InvoiceData, value: any) => {
    if (!invoiceData) return;
    setInvoiceData({ ...invoiceData, [field]: value });
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    if (!invoiceData) return;
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);
    setInvoiceData({
      ...invoiceData,
      items: newItems,
      subtotal,
      totalAmount: subtotal + (invoiceData.shippingCost || 0) - (invoiceData.discount || 0),
    });
  };

  const addInvoiceItem = () => {
    if (!invoiceData) return;
    const newItems = [...invoiceData.items, { productName: '', quantity: 1, unitPrice: 0, total: 0 }];
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const removeInvoiceItem = (index: number) => {
    if (!invoiceData || invoiceData.items.length <= 1) return;
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);
    setInvoiceData({
      ...invoiceData,
      items: newItems,
      subtotal,
      totalAmount: subtotal + (invoiceData.shippingCost || 0) - (invoiceData.discount || 0),
    });
  };

  const handlePreview = () => {
    if (!invoiceData) return;
    const finalData = {
      ...invoiceData,
      signatureUrl: signatureFile || undefined,
      useLogoAsSignature: useLogoSignature,
    };
    setInvoiceData(finalData);
    setShowPreview(true);
  };

  const handleDownload = useCallback(async () => {
    if (!invoiceData) return;
    setGenerating(true);
    try {
      const finalData = {
        ...invoiceData,
        signatureUrl: signatureFile || undefined,
        useLogoAsSignature: useLogoSignature,
      };
      const InvoicePDFModule = await import('@/components/invoice/InvoicePDF');
      const InvoicePDFComp = InvoicePDFModule.default;
      const blob = await pdf(<InvoicePDFComp data={finalData} logoUrl={LOGO_URL} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${finalData.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccessMsg('PDF downloaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [invoiceData, signatureFile, useLogoSignature]);

  const handleShareViaEmail = useCallback(async () => {
    if (!invoiceData) return;
    setSending(true);
    try {
      const finalData = {
        ...invoiceData,
        signatureUrl: signatureFile || undefined,
        useLogoAsSignature: useLogoSignature,
      };

      const InvoicePDFModule = await import('@/components/invoice/InvoicePDF');
      const InvoicePDFComp = InvoicePDFModule.default;
      const blob = await pdf(<InvoicePDFComp data={finalData} logoUrl={LOGO_URL} />).toBlob();

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          await api.post('/admin/send-invoice', {
            to: finalData.customerEmail,
            subject: `Invoice ${finalData.invoiceNumber} from H&B Trade - Order ${finalData.orderNumber}`,
            invoiceNumber: finalData.invoiceNumber,
            customerName: finalData.customerName,
            attachment: base64,
            attachmentName: `${finalData.invoiceNumber}.pdf`,
          });
          setSuccessMsg('Invoice sent via email successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err: any) {
          openMailto(finalData);
        } finally {
          setSending(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      if (invoiceData) openMailto(invoiceData);
      setSending(false);
    }
  }, [invoiceData, signatureFile, useLogoSignature]);

  const openMailto = (data: InvoiceData) => {
    const adminEmail = typeof window !== 'undefined' && localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).email
      : '';
    const mailto = `mailto:${data.customerEmail || ''}?from=${adminEmail}&subject=${encodeURIComponent(`Invoice ${data.invoiceNumber} from H&B Trade - Order ${data.orderNumber}`)}&body=${encodeURIComponent(`Dear ${data.customerName},\n\nPlease find attached your invoice ${data.invoiceNumber} for order ${data.orderNumber}.\n\nTotal Amount: ৳${data.totalAmount.toFixed(2)}\n\nThank you for your business!\n\nBest regards,\nH&B Trade`)}`;
    window.open(mailto, '_blank');
  };

  const fmtCurrency = (n: number) => `৳${n.toFixed(2)}`;

  const sourceLabel = sourceType === 'order' ? 'Orders' : sourceType === 'request' ? 'Product Requests' : sourceType === 'service-request' ? 'Service Requests' : 'Custom Invoice';

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle size={20} />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Generator</h1>
          <p className="text-gray-600">Generate professional invoices from orders, requests & service requests</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Button
            variant={sourceType === 'order' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSourceType('order'); setShowEditor(false); }}
          >
            <Package className="mr-2" size={16} />
            Orders
          </Button>
          <Button
            variant={sourceType === 'request' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSourceType('request'); setShowEditor(false); }}
          >
            <ClipboardList className="mr-2" size={16} />
            Product Requests
          </Button>
          <Button
            variant={sourceType === 'service-request' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSourceType('service-request'); setShowEditor(false); }}
          >
            <Wrench className="mr-2" size={16} />
            Service Requests
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCreateCustomInvoice}
          >
            <Plus className="mr-2" size={16} />
            Custom Invoice
          </Button>
        </div>
      </div>

      {!showEditor && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <Input
                    placeholder={`Search ${sourceLabel.toLowerCase()}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    <Search size={16} />
                  </Button>
                </form>
                <Button variant="ghost" size="sm" onClick={() => { setPage(1); fetchData(); }}>
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Select a {sourceLabel.slice(0, -1)} to Generate Invoice
                </CardTitle>
                <span className="text-sm text-gray-500">{total} total</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">No {sourceLabel.toLowerCase()} found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Number</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product / Service</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-medium">{item.number}</td>
                          <td className="px-6 py-4 text-sm">{item.customerName}</td>
                          <td className="px-6 py-4 text-sm max-w-[200px] truncate">{item.productName}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.date)}</td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {item.amount > 0 ? fmtCurrency(item.amount) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <Button size="sm" onClick={() => handleSelectItem(item)}>
                              <FileText className="mr-1" size={14} />
                              Generate
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t">
                  <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {showEditor && invoiceData && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setShowEditor(false); setShowPreview(false); }}>
              <X size={16} className="mr-1" />
              Back
            </Button>
            <h2 className="text-xl font-bold text-gray-900">Edit Invoice Details</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Number</label>
                    <Input value={invoiceData.invoiceNumber} onChange={(e) => updateInvoiceField('invoiceNumber', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date</label>
                    <Input type="date" value={invoiceData.invoiceDate.split('T')[0]} onChange={(e) => updateInvoiceField('invoiceDate', new Date(e.target.value).toISOString())} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                    <Input type="date" value={invoiceData.dueDate.split('T')[0]} onChange={(e) => updateInvoiceField('dueDate', new Date(e.target.value).toISOString())} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Customer Name</label>
                    <Input value={invoiceData.customerName} onChange={(e) => updateInvoiceField('customerName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Customer Email</label>
                    <Input type="email" value={invoiceData.customerEmail || ''} onChange={(e) => updateInvoiceField('customerEmail', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Customer Phone</label>
                    <Input value={invoiceData.customerPhone || ''} onChange={(e) => updateInvoiceField('customerPhone', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Customer WhatsApp</label>
                    <Input value={invoiceData.customerWhatsapp || ''} onChange={(e) => updateInvoiceField('customerWhatsapp', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Customer Address</label>
                    <Textarea value={invoiceData.customerAddress || ''} onChange={(e) => updateInvoiceField('customerAddress', e.target.value)} rows={2} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Delivery Address</label>
                    <Textarea value={invoiceData.deliveryAddress || ''} onChange={(e) => updateInvoiceField('deliveryAddress', e.target.value)} rows={2} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Shipping Method</label>
                    <Input value={invoiceData.shippingMethod || ''} onChange={(e) => updateInvoiceField('shippingMethod', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Net Weight</label>
                    <Input value={invoiceData.netWeight || ''} onChange={(e) => updateInvoiceField('netWeight', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Payment Info</label>
                    <Input value={invoiceData.paymentInfo || ''} onChange={(e) => updateInvoiceField('paymentInfo', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Upload Signature</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" size={14} />
                    Choose from Desktop
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={useLogoSignature ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={handleLogoSignature}
                  >
                    <ImageIcon className="mr-2" size={14} />
                    Use Logo
                  </Button>
                </div>
                {(signatureFile || useLogoSignature) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-xs font-medium text-gray-500 mb-2">Signature Preview</p>
                    {useLogoSignature ? (
                      <img src={LOGO_URL} alt="Logo Signature" className="h-12 object-contain" />
                    ) : signatureFile ? (
                      <img src={signatureFile} alt="Uploaded Signature" className="h-12 object-contain" />
                    ) : null}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <Textarea value={invoiceData.notes || ''} onChange={(e) => updateInvoiceField('notes', e.target.value)} rows={3} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Product Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="mr-1" size={14} />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Per Pc</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Weight</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Volume</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2">
                          <Input value={item.productName} onChange={(e) => updateInvoiceItem(idx, 'productName', e.target.value)} className="min-w-[120px]" />
                        </td>
                        <td className="px-4 py-2">
                          <Input value={item.productCode || ''} onChange={(e) => updateInvoiceItem(idx, 'productCode', e.target.value)} className="w-20" />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" value={item.quantity} onChange={(e) => updateInvoiceItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="w-16" />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" value={item.unitPrice} onChange={(e) => updateInvoiceItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-24" />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" value={item.perPiecePrice || ''} onChange={(e) => updateInvoiceItem(idx, 'perPiecePrice', parseFloat(e.target.value) || 0)} className="w-24" />
                        </td>
                        <td className="px-4 py-2">
                          <Input value={item.weight || ''} onChange={(e) => updateInvoiceItem(idx, 'weight', e.target.value)} className="w-20" />
                        </td>
                        <td className="px-4 py-2">
                          <Input value={item.volume || ''} onChange={(e) => updateInvoiceItem(idx, 'volume', e.target.value)} className="w-20" />
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold text-primary">
                          {fmtCurrency(item.total)}
                        </td>
                        <td className="px-4 py-2">
                          {invoiceData.items.length > 1 && (
                            <button onClick={() => removeInvoiceItem(idx)} className="text-red-400 hover:text-red-600">
                              <Minus size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{fmtCurrency(invoiceData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center gap-2">
                    <span className="text-gray-500">Shipping</span>
                    <Input
                      type="number"
                      value={invoiceData.shippingCost || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateInvoiceField('shippingCost', val);
                        updateInvoiceField('totalAmount', invoiceData.subtotal + val - (invoiceData.discount || 0));
                      }}
                      className="w-24 text-right"
                    />
                  </div>
                  <div className="flex justify-between text-sm items-center gap-2">
                    <span className="text-gray-500">Discount</span>
                    <Input
                      type="number"
                      value={invoiceData.discount || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateInvoiceField('discount', val);
                        updateInvoiceField('totalAmount', invoiceData.subtotal + (invoiceData.shippingCost || 0) - val);
                      }}
                      className="w-24 text-right"
                    />
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2">
                    <span className="text-primary">Total</span>
                    <span className="text-primary">{fmtCurrency(invoiceData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={handlePreview} disabled={!invoiceData}>
                  <Eye className="mr-2" size={16} />
                  Preview
                </Button>
                <Button onClick={handleDownload} disabled={generating || !invoiceData}>
                  <Download className="mr-2" size={16} />
                  {generating ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button variant="secondary" onClick={handleShareViaEmail} disabled={sending || !invoiceData}>
                  <Mail className="mr-2" size={16} />
                  {sending ? 'Sending...' : 'Share via Email'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showPreview && invoiceData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">PDF Preview</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <style>
                          body { margin: 0; padding: 20px; font-family: sans-serif; background: #f3f4f6; }
                          .preview-box { background: white; padding: 40px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px; }
                          .header { background: #0d9488; color: white; padding: 20px; border-radius: 6px 6px 0 0; display: flex; justify-content: space-between; }
                          .accent { height: 4px; background: #f97316; }
                          h1 { margin: 0; font-size: 24px; }
                          .subtitle { font-size: 11px; opacity: 0.85; margin-top: 4px; }
                          .inv-num { font-size: 18px; font-weight: bold; text-align: right; }
                          .inv-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
                          .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 20px 0; }
                          .info-box { background: #f9fafb; padding: 14px; border-radius: 6px; border: 1px solid #e5e7eb; }
                          .info-title { font-size: 9px; font-weight: 700; color: #0d9488; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
                          .field { margin-bottom: 4px; font-size: 10px; }
                          .field-label { color: #9ca3af; }
                          .field-value { color: #1e293b; font-weight: 500; }
                          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                          th { background: #0d9488; color: white; padding: 8px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
                          td { padding: 8px; font-size: 10px; border-bottom: 1px solid #e5e7eb; }
                          tr:nth-child(even) td { background: #f0fdfa; }
                          .total-section { text-align: right; margin-top: 12px; }
                          .total-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; max-width: 300px; margin-left: auto; }
                          .total-final { font-size: 14px; font-weight: bold; color: #0d9488; border-top: 2px solid #0d9488; padding-top: 8px; margin-top: 8px; }
                          .footer { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
                        </style>
                      </head>
                      <body>
                        <div class="preview-box">
                          <div class="header">
                            <div><h1>H&B Trade</h1><div class="subtitle">China to Bangladesh Product Sourcing & Shipping</div></div>
                            <div><div class="inv-label">Invoice</div><div class="inv-num">${invoiceData.invoiceNumber}</div></div>
                          </div>
                          <div class="accent"></div>
                          <div class="info-grid">
                            <div class="info-box">
                              <div class="info-title">Invoice Details</div>
                              <div class="field"><span class="field-label">Date: </span><span class="field-value">${new Date(invoiceData.invoiceDate).toLocaleDateString()}</span></div>
                              <div class="field"><span class="field-label">Order: </span><span class="field-value">${invoiceData.orderNumber}</span></div>
                              <div class="field"><span class="field-label">Due: </span><span class="field-value">${new Date(invoiceData.dueDate).toLocaleDateString()}</span></div>
                            </div>
                            <div class="info-box">
                              <div class="info-title">Bill To</div>
                              <div class="field"><span class="field-label">Name: </span><span class="field-value">${invoiceData.customerName}</span></div>
                              <div class="field"><span class="field-label">Email: </span><span class="field-value">${invoiceData.customerEmail || '-'}</span></div>
                              <div class="field"><span class="field-label">Phone: </span><span class="field-value">${invoiceData.customerPhone || '-'}</span></div>
                            </div>
                            <div class="info-box">
                              <div class="info-title">Ship To</div>
                              <div class="field"><span class="field-label">Name: </span><span class="field-value">${invoiceData.customerName}</span></div>
                              <div class="field"><span class="field-label">Addr: </span><span class="field-value">${invoiceData.deliveryAddress || '-'}</span></div>
                            </div>
                          </div>
                          <table>
                            <thead><tr><th>Item</th><th>Code</th><th>Qty</th><th>Unit Price</th><th>Per Pc</th><th>Weight</th><th>Total</th></tr></thead>
                            <tbody>
                              ${invoiceData.items.map(item => `<tr><td><strong>${item.productName}</strong></td><td>${item.productCode || '-'}</td><td>${item.quantity}</td><td>৳${item.unitPrice.toFixed(2)}</td><td>${item.perPiecePrice ? '৳' + item.perPiecePrice.toFixed(2) : '-'}</td><td>${item.weight || '-'}</td><td><strong>৳${item.total.toFixed(2)}</strong></td></tr>`).join('')}
                            </tbody>
                          </table>
                          <div class="total-section">
                            <div class="total-row"><span>Subtotal:</span><span>৳${invoiceData.subtotal.toFixed(2)}</span></div>
                            ${invoiceData.shippingCost ? `<div class="total-row"><span>Shipping:</span><span>৳${invoiceData.shippingCost.toFixed(2)}</span></div>` : ''}
                            ${invoiceData.discount ? `<div class="total-row"><span>Discount:</span><span>-৳${invoiceData.discount.toFixed(2)}</span></div>` : ''}
                            <div class="total-final"><span>Total: ৳${invoiceData.totalAmount.toFixed(2)}</span></div>
                          </div>
                          <div class="footer">
                            <p>H&B Trade - Your Trusted Sourcing Partner</p>
                            <p>Generated on ${new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                      </body>
                      </html>
                    `}
                    width="100%"
                    height="100%"
                    title="Invoice Preview"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
