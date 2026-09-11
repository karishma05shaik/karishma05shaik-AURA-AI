import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Profile, HistoryItem, ViewType } from '@/types';
import { getInitials, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  Menu, X, FilePlus, FileSearch, Trash2, Settings,
  Camera, ChevronDown, Clock, FileText, BarChart3, Pencil,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType | null;
  onViewChange: (view: ViewType) => void;
  onClearAll: () => void;
  onEditResume: (resumeId: string) => void;
  onViewAnalysis: (analysisId: string) => void;
  history: HistoryItem[];
  refreshKey: number;
}

export default function Sidebar({
  currentView,
  onViewChange,
  onClearAll,
  onEditResume,
  onViewAnalysis,
  history,
  refreshKey,
}: SidebarProps) {
  const { profile, updateAvatar, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!profile) return null;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      if (result.length > 500000) {
        alert('Image too large. Please use a smaller image.');
        return;
      }
      await updateAvatar(result);
    };
    reader.readAsDataURL(file);
  }

  const menuItems = [
    { id: 'create' as ViewType, label: 'Create Resume', icon: FilePlus },
    { id: 'analyze' as ViewType, label: 'Analyze Resume', icon: FileSearch },
  ];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 w-11 h-11 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Profile section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                  {getInitials(profile.name)}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{profile.name}</p>
              <p className="text-xs text-gray-500 truncate">{profile.phone}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Menu items */}
        <div className="p-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                  {item.label}
                </button>
              );
            })}

            {/* Clear */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Trash2 className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              Clear
            </button>
          </div>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {history.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                History
              </div>
              <div className="space-y-0.5">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'resume') {
                        onEditResume(item.id);
                      } else {
                        onViewAnalysis(item.id);
                      }
                      setOpen(false);
                    }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all text-left group"
                  >
                    {item.type === 'resume' ? (
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <BarChart3 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{formatDate(item.created_at)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => {
              onViewChange('settings');
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentView === 'settings'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            Settings
          </button>
        </div>
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Clear all data?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete all your resumes and analysis history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
