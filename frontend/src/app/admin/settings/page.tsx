'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Settings, Save, Loader2, Upload, Trash2, CheckCircle } from 'lucide-react';
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
  wechat_qr: string;
  alipay_qr: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const wechatQrInputRef = useRef<HTMLInputElement>(null);
  const alipayQrInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      const s = response.data.data;
      setFormData({
        company_name: s.company_name || '',
        phone: s.phone || '',
        email: s.email || '',
        whatsapp_link: s.whatsapp_link || '',
        facebook_page: s.facebook_page || '',
        facebook_group: s.facebook_group || '',
        office_address: s.office_address || '',
        bkash: s.bkash || '',
        nagad: s.nagad || '',
        bank_account: s.bank_account || '',
        wechat: s.wechat || '',
        alipay: s.alipay || '',
        wechat_qr: s.wechat_qr || '',
        alipay_qr: s.alipay_qr || '',
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
      fetchSettings();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (field: 'wechat_qr' | 'alipay_qr', file: File) => {
    setMessage({ type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append(field, file);
      const response = await api.post('/admin/settings/qr-upload', fd, {
        headers: { 'Content-Type': undefined as any },
      });
      const updated = response.data.data;
      setFormData(prev => ({
        ...prev,
        wechat_qr: updated.wechat_qr ?? prev.wechat_qr,
        alipay_qr: updated.alipay_qr ?? prev.alipay_qr,
      }));
      setMessage({ type: 'success', text: 'QR code uploaded and saved!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload QR code.' });
    }
  };

  const handleQrRemove = async (field: 'wechat_qr' | 'alipay_qr') => {
    setMessage({ type: '', text: '' });
    try {
      await api.put('/admin/settings', { ...formData, [field]: '' });
      setFormData(prev => ({ ...prev, [field]: '' }));
      setMessage({ type: 'success', text: 'QR code removed.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove QR code.' });
    }
  };

  const getQrImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    return `/qr-codes/${url}`;
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
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' && <CheckCircle size={18} />}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <Input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} placeholder="H&B Trade" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="info@hbtrade.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+880 1234-567890" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Link</label>
                <Input value={formData.whatsapp_link} onChange={(e) => setFormData({ ...formData, whatsapp_link: e.target.value })} placeholder="https://wa.me/8801234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page</label>
                <Input value={formData.facebook_page} onChange={(e) => setFormData({ ...formData, facebook_page: e.target.value })} placeholder="https://facebook.com/hbtrade" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Group</label>
                <Input value={formData.facebook_group} onChange={(e) => setFormData({ ...formData, facebook_group: e.target.value })} placeholder="https://facebook.com/groups/hbtrade" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Address */}
        <Card>
          <CardHeader><CardTitle>Office Address</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={formData.office_address} onChange={(e) => setFormData({ ...formData, office_address: e.target.value })} placeholder="123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh" rows={3} />
            <p className="text-sm text-gray-500 mt-1">Use &quot;|&quot; to separate multiple addresses</p>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader><CardTitle>Payment Settings</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">bKash Number</label>
                <Input value={formData.bkash} onChange={(e) => setFormData({ ...formData, bkash: e.target.value })} placeholder="0183522072" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Number</label>
                <Input value={formData.nagad} onChange={(e) => setFormData({ ...formData, nagad: e.target.value })} placeholder="0183522072" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Details</label>
                <Textarea value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} placeholder={`Bank: The City Bank\nName: MD ARIFUL ISLAM RONY\nAccount Number: 2183964509001\nBranch: Gulshan-02 Avenue\nRouting Number: 225261732\nDhaka, Bangladesh`} rows={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WeChat Pay ID/Link</label>
                <Input value={formData.wechat} onChange={(e) => setFormData({ ...formData, wechat: e.target.value })} placeholder="WeChat ID or payment link" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alipay ID/Link</label>
                <Input value={formData.alipay} onChange={(e) => setFormData({ ...formData, alipay: e.target.value })} placeholder="Alipay ID or payment link" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Setup */}
        <Card>
          <CardHeader><CardTitle>QR Code Images (WeChat & Alipay)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">
                  Upload QR codes via Cloudinary CDN. Works on localhost, hbtrade.ltd, and Vercel. Max 6MB per image.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WeChat QR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WeChat Pay QR Code</label>
                  {formData.wechat_qr ? (
                    <div className="space-y-2">
                      <div className="relative group">
                        <img src={getQrImageSrc(formData.wechat_qr)} alt="WeChat QR" className="w-full h-48 object-contain rounded-lg border bg-white p-2" />
                        <button
                          type="button"
                          onClick={() => handleQrRemove('wechat_qr')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                          title="Remove QR code"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => wechatQrInputRef.current?.click()}>
                        <Upload size={14} className="mr-1" /> Replace Image
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                      onClick={() => wechatQrInputRef.current?.click()}
                    >
                      <Upload className="mx-auto text-primary mb-2" size={28} />
                      <p className="text-gray-600 font-medium text-sm">Click to upload WeChat QR</p>
                      <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF, WebP up to 6MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={wechatQrInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleQrUpload('wechat_qr', e.target.files[0]);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </div>

                {/* Alipay QR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alipay QR Code</label>
                  {formData.alipay_qr ? (
                    <div className="space-y-2">
                      <div className="relative group">
                        <img src={getQrImageSrc(formData.alipay_qr)} alt="Alipay QR" className="w-full h-48 object-contain rounded-lg border bg-white p-2" />
                        <button
                          type="button"
                          onClick={() => handleQrRemove('alipay_qr')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                          title="Remove QR code"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => alipayQrInputRef.current?.click()}>
                        <Upload size={14} className="mr-1" /> Replace Image
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                      onClick={() => alipayQrInputRef.current?.click()}
                    >
                      <Upload className="mx-auto text-primary mb-2" size={28} />
                      <p className="text-gray-600 font-medium text-sm">Click to upload Alipay QR</p>
                      <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF, WebP up to 6MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={alipayQrInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleQrUpload('alipay_qr', e.target.files[0]);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 animate-spin" size={20} />Saving...</>
            ) : (
              <><Save className="mr-2" size={20} />Save All Settings</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
