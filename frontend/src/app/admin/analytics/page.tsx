'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  XCircle, 
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  ClipboardList,
  Wrench,
  Mail,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import api from '@/lib/api';
import { getStatusLabel } from '@/lib/utils';

interface AnalyticsData {
  summary: {
    totalSales: number;
    totalOrders: number;
    allOrders: number;
    pendingOrders: number;
    pendingValue: number;
    processingOrders: number;
    inTransitOrders: number;
    cancelledOrders: number;
    cancelledValue: number;
    estimatedProfit: number;
    estimatedCost: number;
    totalRequests: number;
    totalServiceRequests: number;
    unreadMessages: number;
  };
  ordersByStatus: Array<{ status: string; count: number; total: number }>;
  dailySales: Array<{ date: string; orders: number; sales: number }>;
  shippingMethods: Array<{ shipping_method: string; count: number; total: number }>;
  topProducts: Array<{ product_name: string; orders: number; revenue: number }>;
  topCustomers: Array<{ customer_name: string; orders: number; revenue: number }>;
}

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#6366f1'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/analytics?period=${period}`);
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `৳${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">No analytics data available</div>;
  }

  const statusChartData = data.ordersByStatus.map(item => ({
    name: getStatusLabel(item.status),
    value: item.count,
    total: item.total
  }));

  const shippingChartData = data.shippingMethods
    .filter(item => item.shipping_method)
    .map(item => ({
      name: item.shipping_method,
      value: item.count,
      total: item.total
    }));

  const salesChartData = data.dailySales.slice(0, 14).reverse().map(item => ({
    date: new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: item.sales,
    orders: item.orders
  }));

  const s = data.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Sales, orders, and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Sales (Delivered)</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(s.totalSales)}</p>
                <p className="text-xs text-green-600 mt-1">{s.totalOrders} delivered orders</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Estimated Profit</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(s.estimatedProfit)}</p>
                <p className="text-xs text-blue-600 mt-1">~20% margin on {formatCurrency(s.estimatedCost)} cost</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-700">{s.pendingOrders}</p>
                <p className="text-xs text-yellow-600 mt-1">{formatCurrency(s.pendingValue)} value</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-700">{s.cancelledOrders}</p>
                <p className="text-xs text-red-600 mt-1">{formatCurrency(s.cancelledValue)} lost</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <XCircle className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-teal-600">All Orders</p>
            <p className="text-xl font-bold text-teal-700">{s.allOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-purple-600">Processing</p>
            <p className="text-xl font-bold text-purple-700">{s.processingOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-cyan-600">In Transit</p>
            <p className="text-xl font-bold text-cyan-700">{s.inTransitOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-3 text-center">
            <Package className="mx-auto text-indigo-500 mb-1" size={18} />
            <p className="text-xl font-bold text-indigo-700">{s.totalOrders}</p>
            <p className="text-xs text-indigo-600">Delivered</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 text-center">
            <ClipboardList className="mx-auto text-orange-500 mb-1" size={18} />
            <p className="text-xl font-bold text-orange-700">{s.totalRequests}</p>
            <p className="text-xs text-orange-600">Requests</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-3 text-center">
            <Wrench className="mx-auto text-violet-500 mb-1" size={18} />
            <p className="text-xl font-bold text-violet-700">{s.totalServiceRequests}</p>
            <p className="text-xs text-violet-600">Services</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Sales Trend (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => name === 'sales' ? formatCurrency(value) : value}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#0d9488" 
                    strokeWidth={2}
                    dot={{ fill: '#0d9488', r: 3 }}
                    name="Sales (৳)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 3 }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No sales data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart size={20} />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} orders`} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No order data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {shippingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shippingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0d9488" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No shipping data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={18} />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length > 0 ? (
              <div className="space-y-2">
                {data.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{product.product_name}</p>
                        <p className="text-xs text-gray-500">{product.orders} orders</p>
                      </div>
                    </div>
                    <p className="font-bold text-primary text-sm flex-shrink-0 ml-2">{formatCurrency(product.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCustomers && data.topCustomers.length > 0 ? (
              <div className="space-y-2">
                {data.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-7 h-7 bg-secondary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{customer.customer_name}</p>
                        <p className="text-xs text-gray-500">{customer.orders} orders</p>
                      </div>
                    </div>
                    <p className="font-bold text-secondary text-sm flex-shrink-0 ml-2">{formatCurrency(customer.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No customer data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
