'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Settings, Save, Loader2, Upload, Trash2, CheckCircle, Mail, Send } from 'lucide-react';
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

  const [emailSaving, setEmailSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [emailData, setEmailData] = useState({
    email_from_name: '',
    admin_notification_email: '',
    email_notifications_enabled: true,
    notify_customer_status_updates: true,
    notify_admin_new_activity: true,
  });
  const [emailMeta, setEmailMeta] = useState({ resend_configured: false, email_enabled: true, from_address: '' });

  useEffect(() => {
    fetchSettings();
    fetchEmailSettings();
  }, []);

  const toBool = (v: unknown) => v === true || v === 1 || v === '1';

  const fetchEmailSettings = async () => {
    try {
      const response = await api.get('/admin/email-settings');
      const s = response.data.data;
      setEmailData({
        email_from_name: s.email_from_name || '',
        admin_notification_email: s.admin_notification_email || '',
        email_notifications_enabled: toBool(s.email_notifications_enabled ?? true),
        notify_customer_status_updates: toBool(s.notify_customer_status_updates ?? true),
        notify_admin_new_activity: toBool(s.notify_admin_new_activity ?? true),
      });
      setEmailMeta({
        resend_configured: !!s.resend_configured,
        email_enabled: s.email_enabled !== false,
        from_address: s.from_address || '',
      });
    } catch (error) {
      console.error('Failed to fetch email settings:', error);
    }
  };

  const handleEmailSave = async () => {
    setEmailSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/admin/email-settings', emailData);
      setMessage({ type: 'success', text: 'Email settings saved successfully!' });
      fetchEmailSettings();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save email settings. Please try again.' });
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/admin/email/test', {});
      setMessage({ type: 'success', text: res.data?.message || 'Test email sent successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to send test email. Please try again.' });
    } finally {
      setTesting(false);
    }
  };

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
      const res = await api.put('/admin/settings', formData);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      fetchSettings();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (field: 'wechat_qr' | 'alipay_qr', file: File) => {
    setMessage({ type: '', text: '' });
    try {
      // Use the dedicated QR upload endpoint (already uses Cloudinary in backend)
      const fd = new FormData();
      fd.append(field, file);
      const response = await api.post('/admin/settings/qr-upload', fd);
      const updated = response.data.data;
      setFormData(prev => ({
        ...prev,
        wechat_qr: updated.wechat_qr || prev.wechat_qr,
        alipay_qr: updated.alipay_qr || prev.alipay_qr,
      }));
      setMessage({ type: 'success', text: 'QR code uploaded and saved!' });
    } catch (error: any) {
      console.error('QR upload error:', error);
      const errMsg = error?.response?.data?.error || error?.message || 'Failed to upload QR code.';
      setMessage({ type: 'error', text: errMsg });
    }
  };

  const handleQrRemove = async (field: 'wechat_qr' | 'alipay_qr') => {
    setMessage({ type: '', text: '' });
    try {
      // Send only this field as empty
      await api.put('/admin/settings', { [field]: '' });
      setFormData(prev => ({ ...prev, [field]: '' }));
      setMessage({ type: 'success', text: 'QR code removed.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to remove QR code.' });
    }
  };

  const getQrImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    // Raw base64 string (no data: prefix) — detect by checking if it looks like base64
    if (/^[A-Za-z0-9+/=\s]+$/.test(url) && url.length > 100) {
      return `data:image/png;base64,${url}`;
    }
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

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail size={20} />
              Email Notifications (Resend)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${emailMeta.resend_configured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {emailMeta.resend_configured ? '✓ Resend API configured' : '✗ Resend API key missing'}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${emailMeta.email_enabled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {emailMeta.email_enabled ? 'Sending enabled' : 'Sending disabled (EMAIL_ENABLED=false)'}
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Customers automatically receive welcome, order/service request confirmation, and <strong>every tracking &amp; status update</strong> email (sea, air cargo, hand carry and all other services).
                  Admin receives alerts for every new order, service request, product request, contact message, registration and request conversion.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                  <Input value={emailData.email_from_name} onChange={(e) => setEmailData({ ...emailData, email_from_name: e.target.value })} placeholder="H&B Trade" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notification Email</label>
                  <Input type="email" value={emailData.admin_notification_email} onChange={(e) => setEmailData({ ...emailData, admin_notification_email: e.target.value })} placeholder="admin@hbtrade.ltd" />
                  <p className="text-xs text-gray-500 mt-1">All website activity alerts go to this inbox</p>
                </div>
              </div>
              {emailMeta.from_address && (
                <p className="text-xs text-gray-500">Sending from: <span className="font-mono">{emailMeta.from_address}</span></p>
              )}

              <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailData.email_notifications_enabled}
                    onChange={(e) => setEmailData({ ...emailData, email_notifications_enabled: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-700">Enable all notification emails</span>
                    <span className="block text-xs text-gray-500">Master switch for every outgoing email</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailData.notify_customer_status_updates}
                    onChange={(e) => setEmailData({ ...emailData, notify_customer_status_updates: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-700">Customer status &amp; tracking update emails</span>
                    <span className="block text-xs text-gray-500">Send an email to customers on every status/tracking step</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailData.notify_admin_new_activity}
                    onChange={(e) => setEmailData({ ...emailData, notify_admin_new_activity: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-700">Admin activity alerts</span>
                    <span className="block text-xs text-gray-500">New orders, requests, messages and registrations</span>
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleEmailSave} disabled={emailSaving}>
                  {emailSaving ? (
                    <><Loader2 className="mr-2 animate-spin" size={18} />Saving...</>
                  ) : (
                    <><Save className="mr-2" size={18} />Save Email Settings</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleSendTest} disabled={testing}>
                  {testing ? (
                    <><Loader2 className="mr-2 animate-spin" size={18} />Sending...</>
                  ) : (
                    <><Send className="mr-2" size={18} />Send Test Email</>
                  )}
                </Button>
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
