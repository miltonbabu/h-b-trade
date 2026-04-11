'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Play, Plus, Search, Edit, Trash2, X } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Video } from '@/types';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    youtube_url: '',
    description: '',
    status: 'active',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchVideos();
  }, [statusFilter, pagination.page]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await api.get(`/admin/videos?${params}`);
      setVideos(response.data?.data || []);
      if (response.data?.pagination) {
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchVideos();
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/videos', formData);
      setShowModal(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error('Failed to create video:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedVideo) return;
    try {
      await api.put(`/admin/videos/${selectedVideo.id}`, formData);
      setShowModal(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error('Failed to update video:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/admin/videos/${id}`);
      fetchVideos();
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedVideo(null);
    setShowModal(true);
  };

  const openEditModal = (video: Video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      youtube_url: video.youtube_url,
      description: video.description || '',
      status: video.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      youtube_url: '',
      description: '',
      status: 'active',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
          <p className="text-gray-600">Manage YouTube videos</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2" size={20} />
          Add Video
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search videos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
              <Button type="submit" variant="outline">
                <Search size={20} />
              </Button>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Videos Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Play className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No videos found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">URL</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Play size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{video.title}</p>
                            {video.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {video.description.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={video.youtube_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate max-w-xs"
                        >
                          {video.youtube_url}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(video.status)}`}>
                          {video.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(video.created_at || new Date())}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(video)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(video.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{selectedVideo ? 'Edit Video' : 'Add Video'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Video Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">YouTube URL *</label>
                <Input
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Video description..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={selectedVideo ? handleUpdate : handleCreate}>
                  {selectedVideo ? 'Update' : 'Add Video'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}