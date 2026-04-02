import { useState } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function UploadNotes() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [studentClass, setStudentClass] = useState('8');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
      if (!validTypes.includes(selectedFile.type)) {
        setMessage({ type: 'error', text: 'Please select a valid file (PDF, Image, or Text)' });
        return;
      }
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const classNum = parseInt(studentClass);

      const { count } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('class', classNum);

      if (count !== null && count >= 20) {
        const { data: oldestNote } = await supabase
          .from('notes')
          .select('*')
          .eq('class', classNum)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (oldestNote) {
          const oldPath = oldestNote.file_url.split('/').pop();
          if (oldPath) {
            await supabase.storage.from('notes').remove([`class-${classNum}/${oldPath}`]);
          }
          await supabase.from('notes').delete().eq('id', oldestNote.id);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `class-${classNum}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      const { data: userData } = await supabase.auth.getUser();

      const fileType = file.type.startsWith('image/') ? 'image' :
                       file.type === 'application/pdf' ? 'pdf' : 'text';

      const { error: dbError } = await supabase.from('notes').insert({
        title,
        file_url: publicUrl,
        file_type: fileType,
        class: classNum,
        uploaded_by: userData.user?.id,
      });

      if (dbError) throw dbError;

      setMessage({ type: 'success', text: 'Note uploaded successfully' });
      setTitle('');
      setFile(null);
      setStudentClass('8');
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload note' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Notes</h2>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Chapter 1: Introduction"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class
          </label>
          <select
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File (PDF, Image, or Text)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-input"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-input"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.txt"
                    disabled={loading}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PDF, JPG, PNG, TXT up to 10MB</p>
              {file && (
                <p className="text-sm text-green-600 font-medium">{file.name}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Upload Note'}
        </button>
      </form>
    </div>
  );
}
