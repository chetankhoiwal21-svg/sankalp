import { useEffect, useState } from 'react';
import { Video as VideoIcon, Play, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Video } from '../../types';

interface VideosSectionProps {
  studentClass: number;
}

export default function VideosSection({ studentClass }: VideosSectionProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
    const interval = setInterval(loadVideos, 60000);
    return () => clearInterval(interval);
  }, [studentClass]);

  const loadVideos = async () => {
    try {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('class', studentClass)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      setVideos(data || []);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) return { text: 'Expired', color: 'text-red-600' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const color = hours < 1 ? 'text-red-600' : hours < 6 ? 'text-yellow-600' : 'text-green-600';

    return { text: `${hours}h ${minutes}m left`, color };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading videos...</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <VideoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No videos available</p>
        <p className="text-sm text-gray-500 mt-2">Videos expire 24 hours after upload</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => {
        const timeRemaining = getTimeRemaining(video.expires_at);
        return (
          <div
            key={video.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-blue-100 p-3 rounded-lg">
                <VideoIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{video.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span>{formatDate(video.created_at)}</span>
                  <span className={`flex items-center gap-1 font-medium ${timeRemaining.color}`}>
                    <Clock className="w-4 h-4" />
                    {timeRemaining.text}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={video.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Watch</span>
            </a>
          </div>
        );
      })}
    </div>
  );
}
