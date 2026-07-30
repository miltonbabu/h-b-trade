'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Truck,
  Plus,
  Search,
  Trash2,
  X,
  Eye,
  Package,
  ClipboardList,
  Wrench,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface TrackingEntry {
  id: string;
  tracking_number: string;
  status: string;
  location?: string;
  note?: string;
  created_at: string;
  source_type?: string;
  source_number?: string;
  customer_name?: string;
  product_name?: string;
  product_codes?: string;
  source_status?: string;
}

type SourceFilter = 'all' | 'order' | 'request' | 'service-request' | 'custom';

export default function AdminTrackingPage() {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTrackingNumber, setViewTrackingNumber] = useState('');
  const [viewHistory, setViewHistory] = useState<TrackingEntry[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  const [formData, setFormData] = useState({
    tracking_number: '',
    status: '',
    location: '',
    note: '',
  });

  useEffect(() => {
    setPage(1);
  }, [sourceFilter]);

  useEffect(() => {
    fetchTracking();
  }, [sourceFilter, page]);

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);

      const res = await api.get(`/admin/tracking-all?${params}`);
      setEntries(res.data.data || []);
      if (res.data.pagination) {
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to fetch tracking:', err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTracking();
  };

  const handleAdd = async () => {
    try {
      await api.post('/admin/tracking', formData);
      setShowAddModal(false);
      setFormData({ tracking_number: '', status: '', location: '', note: '' });
      fetchTracking();
    } catch (err) {
      console.error('Failed to add tracking:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this tracking entry?')) return;
    try {
      await api.delete(`/admin/tracking/${id}`);
      fetchTracking();
    } catch (err) {
      console.error('Failed to delete tracking:', err);
    }
  };

  const handleViewHistory = async (trackingNumber: string) => {
    setViewTrackingNumber(trackingNumber);
    setViewLoading(true);
    setShowViewModal(true);
    try {
      const res = await api.get(`/admin/tracking/${trackingNumber}`);
      setViewHistory(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tracking history:', err);
      setViewHistory([]);
    } finally {
      setViewLoading(false);
    }
  };

  const sourceIcon = (type?: string) => {
    switch (type) {
      case 'order': return <Package size={14} className="text-blue-500" />;
      case 'request': return <ClipboardList size={14} className="text-green-500" />;
      case 'service-request': return <Wrench size={14} className="text-secondary" />;
      default: return <FileText size={14} className="text-gray-400" />;
    }
  };

  const sourceBadge = (type?: string) => {
    const map: Record<string, string> = {
      order: 'bg-blue-100 text-blue-700',
      request: 'bg-green-100 text-green-700',
      'service-request': 'bg-secondary/10 text-secondary-700',
      custom: 'bg-gray-100 text-gray-600',
    };
    const label: Record<string, string> = {
      order: 'Order',
      request: 'Request',
      'service-request': 'Service',
      custom: 'Custom',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${map[type || 'custom'] || 'bg-gray-100 text-gray-600'}`}>
        {sourceIcon(type)}
        {label[type || 'custom'] || 'Custom'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracking Management</h1>
          <p className="text-gray-600">View and manage all tracking entries across orders, requests & services</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2" size={20} />
          Add Custom Tracking
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search by tracking #, status, location, customer, product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-lg"
              />
              <Button type="submit" variant="outline" size="sm">
                <Search size={16} />
              </Button>
            </form>
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Sources</option>
                <option value="order">Orders</option>
                <option value="request">Product Requests</option>
                <option value="service-request">Service Requests</option>
                <option value="custom">Custom</option>
              </select>
              <Button variant="ghost" size="sm" onClick={() => { setPage(1); fetchTracking(); }}>
                <RefreshCw size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Tracking Entries</CardTitle>
            <span className="text-sm text-gray-500">{total} total</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No tracking entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order / Ref #</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3">{sourceBadge(entry.source_type)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{entry.source_number || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono">{entry.tracking_number}</td>
                      <td className="px-4 py-3 text-sm">{entry.customer_name || '-'}</td>
                      <td className="px-4 py-3 text-sm max-w-[150px] truncate">{entry.product_name || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">{entry.product_codes || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {entry.location ? (
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" />{entry.location}</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(entry.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewHistory(entry.tracking_number)} title="View history">
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-700" title="Delete permanently">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={14} />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add Custom Tracking</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tracking Number *</label>
                <Input
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <Input
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  placeholder="e.g., Picked Up, In Transit, Delivered"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Guangzhou, China"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Additional details about this update"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAdd}
                  disabled={!formData.tracking_number || !formData.status}
                >
                  Add Tracking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tracking History: {viewTrackingNumber}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent>
              {viewLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : viewHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tracking history found</p>
              ) : (
                <div className="space-y-4">
                  {viewHistory.map((track, index) => (
                    <div key={track.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{track.status}</h3>
                            {track.location && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin size={12} /> {track.location}
                              </p>
                            )}
                            {track.note && (
                              <p className="text-sm text-gray-500 mt-1">{track.note}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(track.created_at)}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleDelete(track.id);
                                setViewHistory(viewHistory.filter((v) => v.id !== track.id));
                              }}
                              className="text-red-600 hover:text-red-700 mt-2"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowViewModal(false);
                        setFormData({ tracking_number: viewTrackingNumber, status: '', location: '', note: '' });
                        setShowAddModal(true);
                      }}
                    >
                      <Plus className="mr-2" size={14} />
                      Add Another Update
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
