import { useEffect, useState } from 'react';
import { FileText, Download, Image as ImageIcon, FileCode } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Note } from '../../types';

interface NotesSectionProps {
  studentClass: number;
}

export default function NotesSection({ studentClass }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [studentClass]);

  const loadNotes = async () => {
    try {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('class', studentClass)
        .order('created_at', { ascending: false });

      setNotes(data || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-green-600" />;
      case 'text':
        return <FileCode className="w-6 h-6 text-blue-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading notes...</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No notes available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            {getIcon(note.file_type)}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{note.title}</h3>
              <p className="text-sm text-gray-500">{formatDate(note.created_at)}</p>
            </div>
          </div>
          <a
            href={note.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>View</span>
          </a>
        </div>
      ))}
    </div>
  );
}
