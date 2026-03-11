'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Truck, Plus, Search, Trash2, X } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Tracking } from '@/types';

export default function AdminTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<Tracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tracking_number: '',
    status: '',
    location: '',
    note: '',
  });

  const handleSearch = async () => {
    if (!trackingNumber.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/admin/tracking/${trackingNumber}`);
      setTrackingData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch tracking:', error);
      setTrackingData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/tracking', formData);
      setShowModal(false);
      setFormData({ tracking_number: '', status: '', location: '', note: '' });
      if (trackingNumber === formData.tracking_number) {
        handleSearch();
      }
    } catch (error) {
      console.error('Failed to create tracking:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tracking entry?')) return;
    try {
      await api.delete(`/admin/tracking/${id}`);
      setTrackingData(trackingData.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete tracking:', error);
    }
  };

  const openCreateModal = (preTrackingNumber?: string) => {
    setFormData({
      tracking_number: preTrackingNumber || '',
      status: '',
      location: '',
      note: '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracking Management</h1>
          <p className="text-gray-600">Manage shipment tracking updates</p>
        </div>
        <Button onClick={() => openCreateModal()}>
          <Plus className="mr-2" size={20} />
          Add Tracking Update
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-md"
            />
            <Button onClick={handleSearch}>
              <Search size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : trackingNumber && trackingData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">No tracking data found for this tracking number</p>
            <Button onClick={() => openCreateModal(trackingNumber)}>
              Add First Update
            </Button>
          </CardContent>
        </Card>
      ) : trackingData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Tracking History for {trackingNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingData.map((track, index) => (
                <div key={track.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{track.status}</h3>
                        {track.location && (
                          <p className="text-sm text-gray-600">Location: {track.location}</p>
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
                          onClick={() => handleDelete(track.id)}
                          className="text-red-600 hover:text-red-700 mt-2"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline" onClick={() => openCreateModal(trackingNumber)}>
                <Plus className="mr-2" size={16} />
                Add Another Update
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Enter a tracking number to view or add tracking updates</p>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add Tracking Update</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
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
                  placeholder="e.g., Order Confirmed, Shipped, In Transit, Delivered"
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
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleCreate}
                  disabled={!formData.tracking_number || !formData.status}
                >
                  Add Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
