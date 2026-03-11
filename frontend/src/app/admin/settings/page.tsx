'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Settings, Save, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Settings as SettingsType } from '@/types';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    email: '',
    whatsapp_link: '',
    facebook_page: '',
    facebook_group: '',
    office_address: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      const settings = response.data.data;
      setFormData({
        company_name: settings.company_name || '',
        phone: settings.phone || '',
        email: settings.email || '',
        whatsapp_link: settings.whatsapp_link || '',
        facebook_page: settings.facebook_page || '',
        facebook_group: settings.facebook_group || '',
        office_address: settings.office_address || '',
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/admin/settings', formData);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your company information and contact details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Company Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="H&B Trade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@hbtrade.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1234-567890"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Link
                  </label>
                  <Input
                    value={formData.whatsapp_link}
                    onChange={(e) => setFormData({ ...formData, whatsapp_link: e.target.value })}
                    placeholder="https://wa.me/8801234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook Page
                  </label>
                  <Input
                    value={formData.facebook_page}
                    onChange={(e) => setFormData({ ...formData, facebook_page: e.target.value })}
                    placeholder="https://facebook.com/hbtrade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook Group
                  </label>
                  <Input
                    value={formData.facebook_group}
                    onChange={(e) => setFormData({ ...formData, facebook_group: e.target.value })}
                    placeholder="https://facebook.com/groups/hbtrade"
                  />
                </div>
              </div>
            </div>

            {/* Office Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Office Address</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Address(es)
                </label>
                <Textarea
                  value={formData.office_address}
                  onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                  placeholder="123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use &quot;|&quot; to separate multiple addresses
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t">
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={20} />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
