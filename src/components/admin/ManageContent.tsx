import { useEffect, useState } from 'react';
import { Trash2, FileText, Video as VideoIcon, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Note, Video } from '../../types';

export default function ManageContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      setNotes(notesData || []);
      setVideos(videosData || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (note: Note) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const path = note.file_url.split('/').slice(-2).join('/');
      await supabase.storage.from('notes').remove([path]);
      await supabase.from('notes').delete().eq('id', note.id);

      setMessage({ type: 'success', text: 'Note deleted successfully' });
      loadContent();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete note' });
    }
  };

  const deleteVideo = async (video: Video) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const path = video.file_url.split('/').slice(-2).join('/');
      await supabase.storage.from('videos').remove([path]);
      await supabase.from('videos').delete().eq('id', video.id);

      setMessage({ type: 'success', text: 'Video deleted successfully' });
      loadContent();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete video' });
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
        <div className="space-y-2">
          {notes.length === 0 ? (
            <p className="text-gray-500">No notes uploaded yet</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{note.title}</p>
                    <p className="text-sm text-gray-500">Class {note.class}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteNote(note)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Videos</h2>
        <div className="space-y-2">
          {videos.length === 0 ? (
            <p className="text-gray-500">No videos uploaded yet</p>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <VideoIcon className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{video.title}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Class {video.class}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getTimeRemaining(video.expires_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteVideo(video)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
