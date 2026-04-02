import { useState } from 'react';
import { LogOut, UserPlus, BookOpen, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AddStudent from './admin/AddStudent';
import UploadNotes from './admin/UploadNotes';
import UploadVideo from './admin/UploadVideo';
import ManageContent from './admin/ManageContent';

type Tab = 'students' | 'notes' | 'videos' | 'manage';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('students');

  const tabs = [
    { id: 'students' as Tab, label: 'Add Students', icon: UserPlus },
    { id: 'notes' as Tab, label: 'Upload Notes', icon: BookOpen },
    { id: 'videos' as Tab, label: 'Upload Videos', icon: Video },
    { id: 'manage' as Tab, label: 'Manage', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
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
            {activeTab === 'students' && <AddStudent />}
            {activeTab === 'notes' && <UploadNotes />}
            {activeTab === 'videos' && <UploadVideo />}
            {activeTab === 'manage' && <ManageContent />}
          </div>
        </div>
      </div>
    </div>
  );
}
