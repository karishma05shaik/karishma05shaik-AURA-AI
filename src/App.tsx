import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile, Resume, Analysis, HistoryItem, ViewType } from '@/types';
import Login from '@/components/Login';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import CreateResume from '@/components/CreateResume';
import AnalyzeResume from '@/components/AnalyzeResume';
import Settings from '@/components/Settings';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { profile, loading } = useAuth();
  const [view, setView] = useState<ViewType | null>(null);
  const [editingResume, setEditingResume] = useState<any>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadHistory = useCallback(async () => {
    if (!profile) return;
    const [resumesRes, analysesRes] = await Promise.all([
      supabase.from('resumes').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('analyses').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }),
    ]);

    const items: HistoryItem[] = [];
    if (resumesRes.data) {
      for (const r of resumesRes.data as Resume[]) {
        items.push({
          id: r.id,
          type: 'resume',
          title: r.title,
          subtitle: `${r.template} template`,
          created_at: r.created_at,
          data: r,
        });
      }
    }
    if (analysesRes.data) {
      for (const a of analysesRes.data as Analysis[]) {
        items.push({
          id: a.id,
          type: 'analysis',
          title: a.job_role,
          subtitle: `Score: ${a.score ?? '-'}/10`,
          created_at: a.created_at,
          data: a,
        });
      }
    }
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setHistory(items);
  }, [profile]);

  useEffect(() => {
    if (profile) {
      loadHistory();
      setView(null);
    }
  }, [profile, loadHistory]);

  function handleViewChange(v: ViewType) {
    if (v === 'create') {
      setEditingResume(null);
    }
    setView(v);
  }

  function handleEditResume(resumeId: string) {
    const item = history.find((h) => h.id === resumeId);
    if (item) {
      setEditingResume(item.data);
      setView('edit-resume');
    }
  }

  function handleViewAnalysis(analysisId: string) {
    const item = history.find((h) => h.id === analysisId);
    if (item) {
      setViewingAnalysis(item.data);
      setView('view-analysis');
    }
  }

  async function handleClearAll() {
    if (!profile) return;
    await Promise.all([
      supabase.from('resumes').delete().eq('profile_id', profile.id),
      supabase.from('analyses').delete().eq('profile_id', profile.id),
    ]);
    setHistory([]);
    setRefreshKey((k) => k + 1);
    setView(null);
  }

  function handleResumeSaved() {
    loadHistory();
    setRefreshKey((k) => k + 1);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        currentView={view}
        onViewChange={handleViewChange}
        onClearAll={handleClearAll}
        onEditResume={handleEditResume}
        onViewAnalysis={handleViewAnalysis}
        history={history}
        refreshKey={refreshKey}
      />

      <div className="lg:pl-0">
        {view === null && <Dashboard onViewChange={handleViewChange} />}
        {(view === 'create' || view === 'edit-resume') && (
          <CreateResume
            editingResume={view === 'edit-resume' ? editingResume : undefined}
            onSaved={handleResumeSaved}
            onCancel={() => setView(null)}
          />
        )}
        {view === 'analyze' && <AnalyzeResume />}
        {view === 'settings' && <Settings />}
        {view === 'view-analysis' && viewingAnalysis && (
          <AnalysisView analysis={viewingAnalysis} onBack={() => setView(null)} />
        )}
      </div>
    </div>
  );
}

function AnalysisView({ analysis, onBack }: { analysis: Analysis; onBack: () => void }) {
  const result = analysis.result;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-20 px-4 lg:px-8 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-12 lg:ml-0">
          Analysis: {analysis.job_role}
        </h1>
      </div>
      <div className="p-4 lg:p-8 pt-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 relative">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke={result.score >= 8 ? '#10b981' : result.score >= 5 ? '#f59e0b' : '#ef4444'}
                strokeWidth="4"
                strokeDasharray={`${(result.score / 10) * 226} 226`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl font-bold text-gray-900">{result.score}</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Score out of 10</p>
          <h2 className="text-xl font-bold text-gray-900">{result.verdict}</h2>
          {analysis.file_name && <p className="text-xs text-gray-400 mt-2">File: {analysis.file_name}</p>}
        </div>

        {result.strengths?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Strengths</h3>
            <ul className="space-y-2">
              {result.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.recommendations?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.missingElements?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Missing</h3>
            <ul className="space-y-2">
              {result.missingElements.map((m: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
