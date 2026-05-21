'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, FileText, MessageSquare, Clock, TrendingUp, Users, Wrench } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface DashboardData {
  stats: {
    totalOrders: number;
    totalRequests: number;
    totalServiceRequests: number;
    totalMessages: number;
    unreadMessages: number;
    pendingOrders: number;
  };
  recentOrders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    product_name: string;
    status: string;
    created_at: string;
  }>;
  recentRequests: Array<{
    id: string;
    name: string;
    product_name: string;
    status: string;
    created_at: string;
  }>;
  recentServiceRequests: Array<{
    id: string;
    service_type: string;
    name: string;
    status: string;
    tracking_number: string;
    created_at: string;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: string;
  }>;
  ordersByShipping: Array<{
    shipping_method: string;
    count: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: data?.stats.totalOrders || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Product Requests',
      value: data?.stats.totalRequests || 0,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Service Requests',
      value: data?.stats.totalServiceRequests || 0,
      icon: Wrench,
      color: 'bg-teal-500',
    },
    {
      title: 'Messages',
      value: data?.stats.totalMessages || 0,
      icon: MessageSquare,
      color: 'bg-purple-500',
      badge: data?.stats.unreadMessages || 0,
    },
    {
      title: 'Pending Orders',
      value: data?.stats.pendingOrders || 0,
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center relative`}>
                  <stat.icon className="text-white" size={24} />
                  {stat.badge && stat.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stat.badge}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={20} />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentOrders.length ? (
              <div className="space-y-4">
                {data.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Product Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Recent Product Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentRequests.length ? (
              <div className="space-y-4">
                {data.recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-gray-600">{request.product_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(request.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent requests</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Service Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench size={20} />
              Recent Service Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentServiceRequests?.length ? (
              <div className="space-y-4">
                {data.recentServiceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{request.service_type.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        request.status === 'received' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(request.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent service requests</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.ordersByStatus.length ? (
              <div className="space-y-3">
                {data.ordersByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{getStatusLabel(item.status)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min((parseInt(item.count) / (data?.stats.totalOrders || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Orders by Shipping Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Orders by Shipping Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.ordersByShipping.length ? (
              <div className="space-y-3">
                {data.ordersByShipping.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="capitalize">{item.shipping_method || 'Not specified'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${Math.min((parseInt(item.count) / (data?.stats.totalOrders || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
