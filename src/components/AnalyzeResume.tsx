import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { analyzeResume } from '@/lib/resumeAnalyzer';
import { getInterviewQuestions } from '@/lib/interviewQuestions';
import { AnalysisResult, InterviewQuestion } from '@/types';
import {
  Upload, FileText, Loader2, CheckCircle2, AlertCircle, X,
  Target, TrendingUp, TrendingDown, Lightbulb, Sparkles,
  MessageSquare, ChevronDown, ChevronUp, Star, Zap, Award,
} from 'lucide-react';

export default function AnalyzeResume() {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import('pdfjs-dist');
      // @ts-ignore
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    } else if (file.type.startsWith('image/')) {
      return `[Resume image uploaded: ${file.name}. Note: Image-based resume analysis may be limited.]`;
    }
    return '';
  }

  async function handleAnalyze() {
    if (!file || !jobRole.trim()) {
      setError('Please upload a resume and enter a job role');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setInterviewQuestions(null);

    try {
      const resumeText = await extractTextFromFile(file);
      const analysis = analyzeResume(resumeText, jobRole);
      setResult(analysis);

      if (profile) {
        await supabase.from('analyses').insert({
          profile_id: profile.id,
          job_role: jobRole,
          score: analysis.score,
          result: analysis,
          file_name: fileName,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume.');
    }
    setLoading(false);
  }

  function handleGetInterviewQuestions() {
    if (!jobRole.trim()) return;
    const questions = getInterviewQuestions(jobRole);
    setInterviewQuestions(questions);
  }

  function handleFileSelect(f: File) {
    setFile(f);
    setFileName(f.name);
  }

  function reset() {
    setFile(null);
    setFileName('');
    setJobRole('');
    setResult(null);
    setError('');
    setInterviewQuestions(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-20 px-4 lg:px-8 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 ml-12 lg:ml-0">Analyze Resume</h1>
        {(result || file) && (
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Start Over
          </button>
        )}
      </div>

      <div className="p-4 lg:p-8 pt-4 max-w-4xl mx-auto">
        {!result && (
          <div className="space-y-6">
            {/* Upload area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFileSelect(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{fileName}</p>
                    <p className="text-sm text-gray-500">Click to change file</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Upload your resume</p>
                  <p className="text-sm text-gray-500 mt-1">Drag & drop or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">Supports PDF and image files</p>
                </>
              )}
            </div>

            {/* Job role input */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">Enter the job role you want to analyze your resume against</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Analysis Failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !file || !jobRole.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing your resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">{result.verdict}</h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
                style={{
                  background: result.score >= 8 ? '#d1fae5' : result.score >= 5 ? '#fef3c7' : '#fee2e2',
                  color: result.score >= 8 ? '#065f46' : result.score >= 5 ? '#92400e' : '#991b1b',
                }}
              >
                {result.score >= 8 ? <Star className="w-4 h-4" /> : result.score >= 5 ? <Zap className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {result.score >= 8 ? 'Excellent match' : result.score >= 5 ? 'Good match' : 'Needs improvement'}
              </div>
            </div>

            {/* ATS Score */}
            {result.atsCompatibility && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Target className="w-4.5 h-4.5 text-blue-600" style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">ATS Compatibility</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">ATS Score</span>
                      <span className="text-sm font-bold text-gray-900">{result.atsCompatibility.score}/10</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${result.atsCompatibility.score * 10}%`,
                          background: result.atsCompatibility.score >= 8 ? '#10b981' : result.atsCompatibility.score >= 5 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    {result.atsCompatibility.notes && (
                      <p className="text-sm text-gray-600 mt-2">{result.atsCompatibility.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" style={{ width: 18, height: 18 }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-4.5 h-4.5 text-amber-600" style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Areas to Improve</h3>
                </div>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" style={{ width: 18, height: 18 }} />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Elements */}
            {result.missingElements && result.missingElements.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <X className="w-4.5 h-4.5 text-red-500" style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">What's Missing</h3>
                </div>
                <ul className="space-y-2">
                  {result.missingElements.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4.5 h-4.5 text-blue-600" style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
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

            {/* Keyword match */}
            {result.keywordMatch && (result.keywordMatch.found.length > 0 || result.keywordMatch.missing.length > 0) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Keyword Analysis</h3>
                {result.keywordMatch.found.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-emerald-600 mb-1.5">Found in resume</p>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordMatch.found.map((k, i) => (
                        <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.keywordMatch.missing.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-500 mb-1.5">Missing keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordMatch.missing.map((k, i) => (
                        <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interview Questions */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Want interview questions?</h3>
                  <p className="text-sm text-gray-500">Get frequently asked questions with answers for {jobRole}</p>
                </div>
              </div>

              {!interviewQuestions && (
                <button
                  onClick={handleGetInterviewQuestions}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Yes, provide interview questions
                </button>
              )}

              {interviewQuestions && (
                <div className="space-y-2 mt-4">
                  {interviewQuestions.map((q, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{q.question}</p>
                            <span className="text-xs text-gray-400 mt-0.5 inline-block">{q.category}</span>
                          </div>
                        </div>
                        {expandedQ === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      {expandedQ === i && (
                        <div className="px-4 pb-4 pl-13">
                          <div className="ml-9 bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{q.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
