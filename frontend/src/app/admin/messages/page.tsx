'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Eye, Trash2, X, Mail, User } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Message } from '@/types';
import { useToast, errorMessage } from '@/components/ui/Toast';

export default function AdminMessagesPage() {
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchMessages();
  }, [pagination.page]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await api.get(`/admin/messages?${params}`);
      setMessages(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error(`Failed to load messages: ${errorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/admin/messages/${id}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      toast.error(`Mark-read failed: ${errorMessage(error)}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      fetchMessages();
      toast.success('Message moved to trash');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error(`Delete failed: ${errorMessage(error)}`);
    }
  };

  const openViewModal = async (message: Message) => {
    setSelectedMessage(message);
    setShowModal(true);
    if (!message.is_read) {
      handleMarkRead(message.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">View and manage contact form submissions</p>
      </div>

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${!message.is_read ? 'bg-blue-50' : ''}`}
                  onClick={() => openViewModal(message)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.is_read ? 'bg-gray-200' : 'bg-primary'
                      }`}>
                        <User className={message.is_read ? 'text-gray-600' : 'text-white'} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{message.name}</h3>
                          {!message.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{message.email}</p>
                        {message.subject && (
                          <p className="text-sm font-medium mt-1">{message.subject}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1 truncate">{message.message}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">{formatDate(message.created_at)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewModal(message);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(message.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Message Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedMessage.name}</h3>
                  <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                </div>
              </div>
              
              {selectedMessage.subject && (
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Message</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500">{formatDate(selectedMessage.created_at)}</p>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail size={16} />
                  Reply via Email
                </a>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
