'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Settings, Save, Loader2, Upload, X } from 'lucide-react';
import api from '@/lib/api';

interface SettingsData {
  company_name: string;
  phone: string;
  email: string;
  whatsapp_link: string;
  facebook_page: string;
  facebook_group: string;
  office_address: string;
  bkash: string;
  nagad: string;
  bank_account: string;
  wechat: string;
  alipay: string;
  wechat_qr_path: string;
  alipay_qr_path: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState<SettingsData>({
    company_name: '',
    phone: '',
    email: '',
    whatsapp_link: '',
    facebook_page: '',
    facebook_group: '',
    office_address: '',
    bkash: '',
    nagad: '',
    bank_account: '',
    wechat: '',
    alipay: '',
    wechat_qr: '',
    alipay_qr: '',
  });
  const [wechatQrFile, setWechatQrFile] = useState<File | null>(null);
  const [alipayQrFile, setAlipayQrFile] = useState<File | null>(null);

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
        bkash: settings.bkash || '',
        nagad: settings.nagad || '',
        bank_account: settings.bank_account || '',
        wechat: settings.wechat || '',
        alipay: settings.alipay || '',
        wechat_qr_path: settings.wechat_qr_path || 'wechat-qr.png',
        alipay_qr_path: settings.alipay_qr_path || 'alipay-qr.png',
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
      
      // If there are QR codes selected, upload them automatically
      if (wechatQrFile || alipayQrFile) {
        await handleQrUpload();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async () => {
    if (!wechatQrFile && !alipayQrFile) {
      return; // Silently return if no files selected (for auto-upload)
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const uploadFormData = new FormData();
      if (wechatQrFile) {
        uploadFormData.append('wechat_qr', wechatQrFile);
      }
      if (alipayQrFile) {
        uploadFormData.append('alipay_qr', alipayQrFile);
      }

      const response = await api.post('/admin/settings/qr-upload', uploadFormData);

      const settings = response.data.data;
      setFormData(prev => ({
        ...prev,
        wechat_qr: settings.wechat_qr || prev.wechat_qr,
        alipay_qr: settings.alipay_qr || prev.alipay_qr,
      }));

      setWechatQrFile(null);
      setAlipayQrFile(null);
      setMessage({ type: 'success', text: 'QR codes uploaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload QR codes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  };

  const getImageSrc = (path: string) => {
    if (!path) return '';
    if (path.startsWith('data:')) return path;
    return `${getApiUrl()}${path}`;
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

      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Office Address */}
        <Card>
          <CardHeader>
            <CardTitle>Office Address</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.office_address}
              onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
              placeholder="123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Use &quot;|&quot; to separate multiple addresses
            </p>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  bKash Number
                </label>
                <Input
                  value={formData.bkash}
                  onChange={(e) => setFormData({ ...formData, bkash: e.target.value })}
                  placeholder="0183522072"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nagad Number
                </label>
                <Input
                  value={formData.nagad}
                  onChange={(e) => setFormData({ ...formData, nagad: e.target.value })}
                  placeholder="0183522072"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Details
                </label>
                <Textarea
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  placeholder="Bank: The City Bank
Name: MD ARIFUL ISLAM RONY
Account Number: 2183964509001
Branch: Gulshan-02 Avenue
Routing Number: 225261732
Dhaka, Bangladesh"
                  rows={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WeChat Pay ID/Link
                </label>
                <Input
                  value={formData.wechat}
                  onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                  placeholder="WeChat ID or payment link"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alipay ID/Link
                </label>
                <Input
                  value={formData.alipay}
                  onChange={(e) => setFormData({ ...formData, alipay: e.target.value })}
                  placeholder="Alipay ID or payment link"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Upload */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Images (WeChat & Alipay)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  💡 <strong>Recommended:</strong> Place QR code images in <code className="bg-blue-100 px-2 py-1 rounded">frontend/public/qr-codes/</code> folder
                </p>
                <p className="text-xs text-blue-700">
                  Files named <code>wechat-qr.png</code> and <code>alipay-qr.png</code> will automatically appear in cart page
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WeChat QR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WeChat Pay QR Code Image
                </label>
                {formData.wechat_qr && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={getImageSrc(formData.wechat_qr)}
                      alt="WeChat QR"
                      className="w-40 h-40 object-contain border rounded-lg"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setWechatQrFile(file);
                    }}
                    className="hidden"
                    id="wechat-qr-input"
                  />
                  <label
                    htmlFor="wechat-qr-input"
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Upload size={16} />
                    {wechatQrFile ? wechatQrFile.name : 'Choose Image'}
                  </label>
                  {wechatQrFile && (
                    <button
                      type="button"
                      onClick={() => setWechatQrFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Alipay QR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alipay QR Code Image
                </label>
                {formData.alipay_qr && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={getImageSrc(formData.alipay_qr)}
                      alt="Alipay QR"
                      className="w-40 h-40 object-contain border rounded-lg"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAlipayQrFile(file);
                    }}
                    className="hidden"
                    id="alipay-qr-input"
                  />
                  <label
                    htmlFor="alipay-qr-input"
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Upload size={16} />
                    {alipayQrFile ? alipayQrFile.name : 'Choose Image'}
                  </label>
                  {alipayQrFile && (
                    <button
                      type="button"
                      onClick={() => setAlipayQrFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">
                QR codes will be uploaded automatically when you save settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2" size={20} />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
