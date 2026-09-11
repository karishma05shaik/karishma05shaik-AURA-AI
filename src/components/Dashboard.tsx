import { ViewType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';
import { FilePlus, FileSearch, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onViewChange: (view: ViewType) => void;
}

export default function Dashboard({ onViewChange }: DashboardProps) {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-20 px-4 lg:px-8 py-3">
        <h1 className="text-lg font-semibold text-gray-900 ml-12 lg:ml-0">Dashboard</h1>
      </div>

      <div className="p-4 lg:p-8 pt-4 max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-lg">
                  {getInitials(profile.name)}
                </div>
              )}
              <div>
                <p className="text-white/70 text-sm">Welcome back,</p>
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              </div>
            </div>
            <p className="text-white/80 text-sm max-w-md">
              Create ATS-friendly resumes and analyze them against any job role with AI-powered insights.
            </p>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => onViewChange('create')}
            className="group bg-white rounded-2xl border border-gray-200 p-6 text-left hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FilePlus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Create Resume</h3>
            <p className="text-sm text-gray-500 mb-3">Build an ATS-friendly resume with professional templates</p>
            <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
              Get started <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          <button
            onClick={() => onViewChange('analyze')}
            className="group bg-white rounded-2xl border border-gray-200 p-6 text-left hover:shadow-lg hover:border-emerald-300 transition-all"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSearch className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Analyze Resume</h3>
            <p className="text-sm text-gray-500 mb-3">Upload your resume and get an AI score against any job role</p>
            <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium group-hover:gap-2 transition-all">
              Start analyzing <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            What AURA AI can do
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: FilePlus, title: 'ATS Resumes', desc: 'Create resumes optimized for Applicant Tracking Systems' },
              { icon: TrendingUp, title: 'Score Analysis', desc: 'Get a score out of 10 on how well your resume matches a job' },
              { icon: Sparkles, title: 'AI Insights', desc: 'Receive recommendations and interview questions powered by AI' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
