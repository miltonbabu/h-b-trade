'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Trash2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CleanupPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/soft-deleted');
      setCounts(res.data.data || {});
    } catch {}
    setIsLoading(false);
  };

  const handleCleanup = async () => {
    if (!confirm('This will PERMANENTLY delete all soft-deleted records and orphan tracking data. This cannot be undone. Continue?')) return;
    setIsCleaning(true);
    setError('');
    setResult(null);
    try {
      const res = await api.delete('/admin/cleanup/soft-deleted');
      setResult(res.data);
      fetchCounts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Cleanup failed');
    } finally {
      setIsCleaning(false);
    }
  };

  const totalSoftDeleted = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const tableLabels: Record<string, string> = {
    orders: 'Orders',
    product_requests: 'Product Requests',
    service_requests: 'Service Requests',
    products: 'Products',
    videos: 'Videos',
    messages: 'Messages',
    event_registrations: 'Event Registrations',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Cleanup</h1>
        <p className="text-gray-600 mt-1">Permanently remove soft-deleted records to free up space</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}

      {result && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} />
            <span className="font-medium">Cleanup complete</span>
          </div>
          <div className="text-sm mt-1">
            {Object.entries(result.deleted || {}).map(([key, val]) => (
              val ? <span key={key} className="inline-block mr-3">{tableLabels[key] || key}: {String(val)} deleted</span> : null
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Soft-Deleted Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>
          ) : totalSoftDeleted === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              No soft-deleted records found. Database is clean.
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {Object.entries(counts).map(([table, count]) => {
                  if (count === 0) return null;
                  return (
                    <div key={table} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{tableLabels[table] || table}</span>
                      <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-2.5 py-0.5 rounded-full">
                        {count} soft-deleted
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">This action is irreversible</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {totalSoftDeleted} soft-deleted records will be permanently removed, along with any orphan tracking data. Customers who soft-deleted their own data will no longer see it, and admins won't be able to recover it.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCleanup}
                disabled={isCleaning}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isCleaning ? (
                  <><Loader2 className="animate-spin mr-2" size={16} /> Cleaning up...</>
                ) : (
                  <><Trash2 size={16} className="mr-2" /> Permanently Delete All Soft-Deleted Records</>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
