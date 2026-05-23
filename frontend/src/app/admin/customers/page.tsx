'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import {
  Users, Search, Eye, Edit3, Trash2, Loader2, X,
  Mail, Phone, Building, Package, FileText, Wrench,
  Save, ChevronLeft, ChevronRight, KeyRound, UserPlus
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  created_at: string;
  updated_at?: string;
}

interface CustomerDetail extends Customer {
  orders: any[];
  productRequests: any[];
  serviceRequests: any[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', whatsapp: '', company: '' });
  const [resetCustomer, setResetCustomer] = useState<Customer | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '', whatsapp: '', company: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/customers', {
        params: { page, limit: 20, search: search || undefined }
      });
      setCustomers(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCustomer = async (id: string) => {
    try {
      const res = await api.get(`/admin/customers/${id}`);
      setSelectedCustomer(res.data.data);
    } catch (err) {
      setError('Failed to load customer details');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddCustomer = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      setError('Name, email, and password are required');
      return;
    }
    if (addForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await api.post('/admin/customers', addForm);
      setShowAddCustomer(false);
      setAddForm({ name: '', email: '', password: '', phone: '', whatsapp: '', company: '' });
      setSuccess('Customer created successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone || '',
      whatsapp: customer.whatsapp || '',
      company: customer.company || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;
    try {
      await api.put(`/admin/customers/${editingCustomer.id}`, editForm);
      setEditingCustomer(null);
      setSuccess('Customer updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCustomer || !newPassword) return;
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await api.put(`/admin/customers/${resetCustomer.id}/reset-password`, { newPassword });
      setResetCustomer(null);
      setNewPassword('');
      setSuccess(`Password reset successfully for ${resetCustomer.name}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure? This will PERMANENTLY delete this customer and ALL their data (orders, requests, etc). This cannot be undone.')) return;
    try {
      await api.delete(`/admin/customers/${id}`);
      setSuccess('Customer permanently deleted');
      setTimeout(() => setSuccess(''), 3000);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteAllCustomerData = async (id: string, name: string) => {
    if (!confirm(`Permanently delete ALL data (orders, requests, tracking) for ${name}? The customer account will remain. This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/customers/${id}/all-data`);
      setSuccess(`All data deleted for ${name}`);
      setTimeout(() => setSuccess(''), 3000);
      if (selectedCustomer) handleViewCustomer(selectedCustomer.id);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete data');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleHardDeleteItem = async (customerId: string, type: string, itemId: string) => {
    if (!confirm(`Permanently delete this ${type}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/customers/${customerId}/${type}/${itemId}`);
      setSuccess(`${type} permanently deleted`);
      setTimeout(() => setSuccess(''), 3000);
      if (selectedCustomer) handleViewCustomer(selectedCustomer.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">Manage customer accounts ({total} total)</p>
      </div>

      {(error || success) && (
        <div className={`mb-4 px-4 py-3 rounded-lg ${error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {error || success}
        </div>
      )}

      <div className="mb-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, phone, or company..."
            className="pl-10"
          />
        </div>
        <Button onClick={() => { setShowAddCustomer(true); setAddForm({ name: '', email: '', password: '', phone: '', whatsapp: '', company: '' }); }} className="flex items-center gap-2">
          <UserPlus size={16} />
          Add Customer
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Phone</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Company</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Joined</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{customer.email}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 hidden md:table-cell">{customer.phone || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 hidden lg:table-cell">{customer.company || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 hidden md:table-cell">{formatDate(customer.created_at)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleViewCustomer(customer.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="View">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleEditCustomer(customer)} className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg" title="Edit">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => { setResetCustomer(customer); setNewPassword(''); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Reset Password">
                              <KeyRound size={16} />
                            </button>
                            <button onClick={() => handleDeleteCustomer(customer.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1" title="Delete Customer">
                              <Trash2 size={16} />
                              <span className="hidden sm:inline text-xs">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">No customers found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft size={16} /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                  <p className="text-gray-500">{selectedCustomer.email}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} /> {selectedCustomer.phone}
                  </div>
                )}
                {selectedCustomer.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building size={14} /> {selectedCustomer.company}
                  </div>
                )}
                <div className="text-sm text-gray-500">Joined: {formatDate(selectedCustomer.created_at)}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Package size={16} /> Orders ({selectedCustomer.orders?.length || 0})
                  </h3>
                  {(selectedCustomer.orders || []).map((o: any) => (
                    <div key={o.id} className="text-sm py-1.5 px-3 border-b border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium truncate">#{o.order_number}</span>
                        <span className="text-gray-500 truncate">{o.product_name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          o.status === 'delivered' ? 'bg-green-100 text-green-800' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>{o.status}</span>
                      </div>
                      <button onClick={() => handleHardDeleteItem(selectedCustomer.id, 'orders', o.id)} className="p-1 text-red-400 hover:text-red-600 shrink-0" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText size={16} /> Product Requests ({selectedCustomer.productRequests?.length || 0})
                  </h3>
                  {(selectedCustomer.productRequests || []).map((r: any) => (
                    <div key={r.id} className="text-sm py-1.5 px-3 border-b border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="truncate">{r.product_name}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 shrink-0">{r.status}</span>
                      </div>
                      <button onClick={() => handleHardDeleteItem(selectedCustomer.id, 'product-requests', r.id)} className="p-1 text-red-400 hover:text-red-600 shrink-0" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Wrench size={16} /> Service Requests ({selectedCustomer.serviceRequests?.length || 0})
                  </h3>
                  {(selectedCustomer.serviceRequests || []).map((r: any) => (
                    <div key={r.id} className="text-sm py-1.5 px-3 border-b border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="truncate">{r.service_type?.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 shrink-0">{r.status}</span>
                      </div>
                      <button onClick={() => handleHardDeleteItem(selectedCustomer.id, 'service-requests', r.id)} className="p-1 text-red-400 hover:text-red-600 shrink-0" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => handleDeleteAllCustomerData(selectedCustomer.id, selectedCustomer.name)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-medium text-sm"
                >
                  <Trash2 size={16} />
                  Delete All Customer Data (Orders, Requests, Tracking)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingCustomer(null)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Edit Customer</h2>
                <button onClick={() => setEditingCustomer(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <Input value={editForm.whatsapp} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <Input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setEditingCustomer(null)}>Cancel</Button>
                  <Button onClick={handleSaveEdit}>
                    <Save size={16} className="mr-1" /> Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {resetCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setResetCustomer(null)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Reset Password</h2>
                <button onClick={() => setResetCustomer(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Set a new password for <span className="font-semibold">{resetCustomer.name}</span> ({resetCustomer.email})
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setResetCustomer(null)}>Cancel</Button>
                  <Button onClick={handleResetPassword} disabled={newPassword.length < 6}>
                    <KeyRound size={16} className="mr-1" /> Reset Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddCustomer(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Add New Customer</h2>
                <button onClick={() => setShowAddCustomer(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="customer@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <Input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="At least 6 characters" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="+880 1XXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <Input value={addForm.whatsapp} onChange={(e) => setAddForm({ ...addForm, whatsapp: e.target.value })} placeholder="WhatsApp number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <Input value={addForm.company} onChange={(e) => setAddForm({ ...addForm, company: e.target.value })} placeholder="Company name" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
                  <Button onClick={handleAddCustomer} disabled={!addForm.name || !addForm.email || !addForm.password}>
                    <UserPlus size={16} className="mr-1" /> Create Customer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
