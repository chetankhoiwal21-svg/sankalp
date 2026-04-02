import { useState } from 'react';
import { LogOut, BookOpen, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotesSection from './student/NotesSection';
import VideosSection from './student/VideosSection';

type Tab = 'notes' | 'videos';

export default function StudentDashboard() {
  const { student, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  if (!student) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  const tabs = [
    { id: 'notes' as Tab, label: 'Notes', icon: BookOpen },
    { id: 'videos' as Tab, label: 'Videos', icon: Video },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-sm text-gray-600">Class {student.class}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'notes' && <NotesSection studentClass={student.class} />}
            {activeTab === 'videos' && <VideosSection studentClass={student.class} />}
          </div>
        </div>
      </div>
    </div>
  );
}
