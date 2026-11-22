'use client';

import { useEffect, useState, useCallback, Fragment, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Search, RefreshCw, Loader2, Send, AlertCircle, CheckCircle, Clock, SkipForward } from 'lucide-react';
import api from '@/lib/api';
import type { EmailLog } from '@/types';

const STATUS_STYLES: Record<string, { className: string; icon: ReactNode }> = {
  sent: { className: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
  failed: { className: 'bg-red-100 text-red-700', icon: <AlertCircle size={12} /> },
  queued: { className: 'bg-blue-100 text-blue-700', icon: <Clock size={12} /> },
  skipped: { className: 'bg-gray-100 text-gray-600', icon: <SkipForward size={12} /> },
};

const CATEGORY_LABELS: Record<string, string> = {
  welcome: 'Welcome',
  order_confirmation: 'Order Confirmation',
  order_status_update: 'Order Status Update',
  service_request_received: 'Service Request Received',
  service_status_update: 'Service Status Update',
  product_request_received: 'Product Request Received',
  product_status_update: 'Product Status Update',
  quote_ready: 'Quote Ready',
  converted_to_order: 'Converted to Order',
  tracking_update: 'Tracking Update',
  contact_auto_reply: 'Contact Auto-Reply',
  event_registration: 'Event Registration',
  invoice: 'Invoice',
  admin_alert: 'Admin Alert',
  test: 'Test',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);
const STATUSES = ['sent', 'failed', 'queued', 'skipped'];

export default function AdminEmailLogPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search.trim()) params.q = search.trim();
      const response = await api.get('/admin/email-log', { params });
      setLogs(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch email log:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Log</h1>
          <p className="text-gray-600">Every notification email sent to customers and admins via Resend</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          {loading ? <Loader2 className="mr-2 animate-spin" size={16} /> : <RefreshCw className="mr-2" size={16} />}
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search recipient or subject..."
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Log table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} />
            Sent Emails
            <span className="text-sm font-normal text-gray-500">({total} total)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="mx-auto mb-3 text-gray-300" size={40} />
              <p>No emails found. Emails will appear here once the system starts sending notifications.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3 pr-4">Time</th>
                    <th className="py-3 pr-4">Recipient</th>
                    <th className="py-3 pr-4">Subject</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const statusStyle = STATUS_STYLES[log.status] || STATUS_STYLES.queued;
                    const isExpanded = expandedId === log.id;
                    return (
                      <Fragment key={log.id}>
                        <tr
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        >
                          <td className="py-3 pr-4 whitespace-nowrap text-gray-500">{formatDate(log.created_at)}</td>
                          <td className="py-3 pr-4 text-gray-900 font-medium">{log.to_email}</td>
                          <td className="py-3 pr-4 text-gray-700 max-w-[260px] truncate">{log.subject || '—'}</td>
                          <td className="py-3 pr-4 text-gray-600">{CATEGORY_LABELS[log.category || ''] || log.category || '—'}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.recipient_type === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                              {log.recipient_type || 'customer'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.className}`}>
                              {statusStyle.icon}
                              {log.status}
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${log.id}-details`} className="bg-gray-50 border-b border-gray-100">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div><span className="text-gray-500 font-medium">From:</span> <span className="font-mono text-xs">{log.from_email || '—'}</span></div>
                                <div><span className="text-gray-500 font-medium">Reply-To:</span> <span className="font-mono text-xs">{log.reply_to || '—'}</span></div>
                                <div><span className="text-gray-500 font-medium">Related:</span> {log.related_type || '—'} {log.related_id ? <span className="font-mono text-xs">({log.related_id})</span> : ''}</div>
                                <div><span className="text-gray-500 font-medium">Resend ID:</span> <span className="font-mono text-xs">{log.resend_id || '—'}</span></div>
                                <div><span className="text-gray-500 font-medium">Sent at:</span> {formatDate(log.sent_at)}</div>
                                {log.error && (
                                  <div className="md:col-span-2">
                                    <span className="text-red-600 font-medium">Error:</span>
                                    <span className="text-red-600 ml-1">{log.error}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
