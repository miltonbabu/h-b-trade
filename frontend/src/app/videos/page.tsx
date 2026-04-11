'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Play, Clock } from 'lucide-react';
import api from '@/lib/api';
import { Video } from '@/types';
import { formatDate } from '@/lib/utils';

function convertToEmbedUrl(youtubeUrl: string): string {
  const videoIdMatch = youtubeUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }
  
  return youtubeUrl;
}

function getVideoThumbnail(youtubeUrl: string): string {
  const videoIdMatch = youtubeUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
  }
  
  return '';
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/videos');
      setVideos(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore <span className="gradient-text">Videos</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch our informative videos about China-Bangladesh trade, product sourcing, and shipping methods
          </p>
        </div>

        {/* Videos Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className="card-hover overflow-hidden cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getVideoThumbnail(video.youtube_url)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="text-primary ml-1" size={28} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-2" />
                    {formatDate(video.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={convertToEmbedUrl(selectedVideo.youtube_url)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-gray-600">{selectedVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}