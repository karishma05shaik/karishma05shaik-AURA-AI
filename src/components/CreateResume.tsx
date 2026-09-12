import { useState, useRef, forwardRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem, AchievementItem } from '@/types';
import {
  Plus, Trash2, Download, Share2, Edit3, FileDown, ChevronLeft, ChevronRight,
  Briefcase, GraduationCap, Wrench, FolderGit2, Award, User, Check, X, Trophy,
} from 'lucide-react';

interface CreateResumeProps {
  editingResume?: any;
  onSaved: () => void;
  onCancel: () => void;
}

const TEMPLATES = [
  { id: 'modern', name: 'Modern', colors: { primary: '#1e3a5f', accent: '#2563eb', bg: '#ffffff', text: '#1f2937', light: '#6b7280' } },
  { id: 'classic', name: 'Classic', colors: { primary: '#1a1a1a', accent: '#333333', bg: '#ffffff', text: '#1a1a1a', light: '#666666' } },
  { id: 'elegant', name: 'Elegant', colors: { primary: '#0f4c3a', accent: '#0f766e', bg: '#ffffff', text: '#1f2937', light: '#6b7280' } },
  { id: 'minimal', name: 'Minimal', colors: { primary: '#374151', accent: '#6b7280', bg: '#ffffff', text: '#1f2937', light: '#9ca3af' } },
  { id: 'creative', name: 'Creative', colors: { primary: '#9333ea', accent: '#a855f7', bg: '#ffffff', text: '#1f2937', light: '#6b7280' } },
  { id: 'professional', name: 'Professional', colors: { primary: '#1e40af', accent: '#2563eb', bg: '#ffffff', text: '#1f2937', light: '#6b7280' } },
];

function genId() {
  return Math.random().toString(36).substring(2, 11);
}

function emptyResume(): ResumeData {
  return {
    name: '', email: '', phone: '', location: '', linkedin: '', website: '',
    summary: '',
    experience: [{ id: genId(), role: '', company: '', startDate: '', endDate: '', description: '' }],
    education: [{ id: genId(), degree: '', institution: '', startDate: '', endDate: '', description: '' }],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
  };
}

export default function CreateResume({ editingResume, onSaved, onCancel }: CreateResumeProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState<'details' | 'template' | 'preview'>('details');
  const [data, setData] = useState<ResumeData>(() => {
    if (editingResume?.data) {
      return { ...emptyResume(), ...editingResume.data };
    }
    const base = emptyResume();
    if (profile) {
      base.name = profile.name;
      base.phone = profile.phone;
    }
    return base;
  });
  const [title, setTitle] = useState(editingResume?.title || 'My Resume');
  const [template, setTemplate] = useState(editingResume?.template || 'modern');
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addExperience() {
    update('experience', [...data.experience, { id: genId(), role: '', company: '', startDate: '', endDate: '', description: '' }]);
  }
  function removeExperience(id: string) {
    update('experience', data.experience.filter((e) => e.id !== id));
  }
  function updateExperience(id: string, field: keyof ExperienceItem, value: string) {
    update('experience', data.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function addEducation() {
    update('education', [...data.education, { id: genId(), degree: '', institution: '', startDate: '', endDate: '', description: '' }]);
  }
  function removeEducation(id: string) {
    update('education', data.education.filter((e) => e.id !== id));
  }
  function updateEducation(id: string, field: keyof EducationItem, value: string) {
    update('education', data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function addProject() {
    update('projects', [...data.projects, { id: genId(), name: '', description: '', link: '' }]);
  }
  function removeProject(id: string) {
    update('projects', data.projects.filter((p) => p.id !== id));
  }
  function updateProject(id: string, field: keyof ProjectItem, value: string) {
    update('projects', data.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function addAchievement() {
    update('achievements', [...data.achievements, { id: genId(), title: '', description: '' }]);
  }
  function removeAchievement(id: string) {
    update('achievements', data.achievements.filter((a) => a.id !== id));
  }
  function updateAchievement(id: string, field: keyof AchievementItem, value: string) {
    update('achievements', data.achievements.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  function addSkill() {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      update('skills', [...data.skills, skillInput.trim()]);
      setSkillInput('');
    }
  }
  function removeSkill(skill: string) {
    update('skills', data.skills.filter((s) => s !== skill));
  }

  function addCert() {
    if (certInput.trim() && !data.certifications.includes(certInput.trim())) {
      update('certifications', [...data.certifications, certInput.trim()]);
      setCertInput('');
    }
  }
  function removeCert(cert: string) {
    update('certifications', data.certifications.filter((c) => c !== cert));
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      if (editingResume?.id) {
        await supabase
          .from('resumes')
          .update({ title, template, data, updated_at: new Date().toISOString() })
          .eq('id', editingResume.id);
      } else {
        await supabase
          .from('resumes')
          .insert({ profile_id: profile.id, title, template, data });
      }
      setShowActions(true);
    } catch {
      alert('Failed to save resume');
    }
    setSaving(false);
  }

  async function handleDownloadPDF() {
    const { default: jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const element = resumePreviewRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
  }

  function handleExport(format: string) {
    let content: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
    } else if (format === 'txt') {
      content = formatResumeAsText(data);
      mimeType = 'text/plain';
    } else {
      content = formatResumeAsHTML(data, selectedTemplate);
      mimeType = 'text/html';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleShare() {
    const shareText = `Check out my resume created with AURA AI!\n\nName: ${data.name}\nEmail: ${data.email}`;
    if (navigator.share) {
      navigator.share({ title: 'My Resume', text: shareText });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileDown },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  const selectedTemplate = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-20 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 ml-12 lg:ml-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          {!showActions ? (
            <>
              {step !== 'details' && (
                <button
                  onClick={() => setStep(step === 'preview' ? 'template' : 'details')}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 inline mr-1" />
                  Back
                </button>
              )}
              {step === 'details' && (
                <button
                  onClick={() => setStep('template')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-1.5"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {step === 'template' && (
                <button
                  onClick={() => setStep('preview')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-1.5"
                >
                  Preview
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {step === 'preview' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : 'Save Resume'}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <div className="relative group">
                <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-1.5">
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
                  {['json', 'txt', 'html'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Export as .{fmt}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setStep('details'); setShowActions(false); }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8 pt-4">
        {step === 'details' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-6">
              {/* Section nav */}
              <div className="hidden md:block w-48 flex-shrink-0">
                <div className="sticky top-20 space-y-1">
                  {sections.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeSection === s.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 space-y-6">
                {activeSection === 'personal' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Full Name" value={data.name} onChange={(v) => update('name', v)} />
                      <Field label="Email" value={data.email} onChange={(v) => update('email', v)} />
                      <Field label="Phone" value={data.phone} onChange={(v) => update('phone', v)} />
                      <Field label="Location" value={data.location} onChange={(v) => update('location', v)} />
                      <Field label="LinkedIn" value={data.linkedin} onChange={(v) => update('linkedin', v)} />
                      <Field label="Website" value={data.website} onChange={(v) => update('website', v)} />
                    </div>
                  </div>
                )}

                {activeSection === 'summary' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Professional Summary</h3>
                    <textarea
                      value={data.summary}
                      onChange={(e) => update('summary', e.target.value)}
                      placeholder="Write a brief professional summary highlighting your experience, key skills, and career goals..."
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    />
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Work Experience</h3>
                      <button onClick={addExperience} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    {data.experience.map((exp, i) => (
                      <div key={exp.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-400">Experience {i + 1}</span>
                          {data.experience.length > 1 && (
                            <button onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Field label="Role" value={exp.role} onChange={(v) => updateExperience(exp.id, 'role', v)} />
                          <Field label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                          <Field label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(exp.id, 'startDate', v)} placeholder="Jan 2022" />
                          <Field label="End Date" value={exp.endDate} onChange={(v) => updateExperience(exp.id, 'endDate', v)} placeholder="Present" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements. Use action verbs and include metrics where possible."
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Education</h3>
                      <button onClick={addEducation} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    {data.education.map((edu, i) => (
                      <div key={edu.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-400">Education {i + 1}</span>
                          {data.education.length > 1 && (
                            <button onClick={() => removeEducation(edu.id)} className="text-red-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Field label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} />
                          <Field label="Institution" value={edu.institution} onChange={(v) => updateEducation(edu.id, 'institution', v)} />
                          <Field label="Start Date" value={edu.startDate} onChange={(v) => updateEducation(edu.id, 'startDate', v)} />
                          <Field label="End Date" value={edu.endDate} onChange={(v) => updateEducation(edu.id, 'endDate', v)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                          <textarea
                            value={edu.description}
                            onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                            placeholder="Additional details, honors, relevant coursework..."
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Skills</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Add a skill and press Enter"
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button onClick={addSkill} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-blue-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'projects' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Projects</h3>
                      <button onClick={addProject} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    {data.projects.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No projects added yet</p>
                    )}
                    {data.projects.map((proj, i) => (
                      <div key={proj.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-400">Project {i + 1}</span>
                          <button onClick={() => removeProject(proj.id)} className="text-red-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <Field label="Project Name" value={proj.name} onChange={(v) => updateProject(proj.id, 'name', v)} />
                        <Field label="Link" value={proj.link} onChange={(v) => updateProject(proj.id, 'link', v)} />
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                          <textarea
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                            placeholder="Describe the project..."
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'certifications' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Certifications</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={certInput}
                        onChange={(e) => setCertInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                        placeholder="Add a certification"
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button onClick={addCert} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.certifications.map((cert) => (
                        <span key={cert} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                          <Award className="w-3.5 h-3.5" />
                          {cert}
                          <button onClick={() => removeCert(cert)} className="text-emerald-400 hover:text-emerald-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'achievements' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Achievements</h3>
                      <button onClick={addAchievement} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    {data.achievements.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No achievements added yet</p>
                    )}
                    {data.achievements.map((ach, i) => (
                      <div key={ach.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-400">Achievement {i + 1}</span>
                          <button onClick={() => removeAchievement(ach.id)} className="text-red-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <Field label="Title" value={ach.title} onChange={(v) => updateAchievement(ach.id, 'title', v)} placeholder="Employee of the Year" />
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                          <textarea
                            value={ach.description}
                            onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)}
                            placeholder="Describe the achievement and its impact..."
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mobile section nav */}
                <div className="md:hidden flex gap-2 overflow-x-auto pb-2">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        activeSection === s.id ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'template' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Choose a template</h3>
            <p className="text-gray-500 text-sm mb-6">Pick a style that suits your personality</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    template === t.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-[3/4] p-4 bg-white">
                    <div className="h-3 rounded mb-2" style={{ background: t.colors.primary, width: '60%' }} />
                    <div className="h-2 rounded mb-1" style={{ background: t.colors.accent, width: '40%' }} />
                    <div className="h-2 rounded mb-3" style={{ background: t.colors.accent, width: '50%' }} />
                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded bg-gray-200" style={{ width: '100%' }} />
                      <div className="h-1.5 rounded bg-gray-200" style={{ width: '90%' }} />
                      <div className="h-1.5 rounded bg-gray-200" style={{ width: '95%' }} />
                    </div>
                    <div className="mt-3 h-2 rounded" style={{ background: t.colors.primary, width: '30%' }} />
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 rounded bg-gray-200" style={{ width: '85%' }} />
                      <div className="h-1.5 rounded bg-gray-200" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  </div>
                  {template === t.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Preview</h3>
              <p className="text-sm text-gray-500">Template: {selectedTemplate.name}</p>
            </div>
            {/* A4 Paper Container */}
            <div className="flex justify-center">
              <div className="shadow-xl rounded-sm overflow-hidden" style={{ width: '210mm', maxWidth: '100%' }}>
                <ResumePreview data={data} template={selectedTemplate} ref={resumePreviewRef} />
              </div>
            </div>
            {showActions && (
              <div className="mt-6 bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-700">Resume saved! Use the buttons above to download, export, edit, or share.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>
  );
}

function formatResumeAsText(data: ResumeData): string {
  const lines: string[] = [];
  lines.push(data.name || '');
  if (data.email) lines.push(data.email);
  if (data.phone) lines.push(data.phone);
  if (data.location) lines.push(data.location);
  if (data.linkedin) lines.push(data.linkedin);
  if (data.website) lines.push(data.website);
  lines.push('');
  if (data.summary) { lines.push('SUMMARY'); lines.push(data.summary); lines.push(''); }
  if (data.experience.some((e) => e.role || e.company)) {
    lines.push('EXPERIENCE');
    for (const exp of data.experience) {
      if (exp.role || exp.company) {
        lines.push(`${exp.role}${exp.company ? ' - ' + exp.company : ''} (${exp.startDate} - ${exp.endDate})`);
        if (exp.description) lines.push(exp.description);
        lines.push('');
      }
    }
  }
  if (data.education.some((e) => e.degree || e.institution)) {
    lines.push('EDUCATION');
    for (const edu of data.education) {
      if (edu.degree || edu.institution) {
        lines.push(`${edu.degree}${edu.institution ? ' - ' + edu.institution : ''} (${edu.startDate} - ${edu.endDate})`);
        if (edu.description) lines.push(edu.description);
        lines.push('');
      }
    }
  }
  if (data.skills.length > 0) { lines.push('SKILLS'); lines.push(data.skills.join(', ')); lines.push(''); }
  if (data.projects.some((p) => p.name)) {
    lines.push('PROJECTS');
    for (const proj of data.projects) {
      if (proj.name) { lines.push(proj.name); if (proj.description) lines.push(proj.description); if (proj.link) lines.push(proj.link); lines.push(''); }
    }
  }
  if (data.certifications.length > 0) { lines.push('CERTIFICATIONS'); lines.push(data.certifications.join('\n')); lines.push(''); }
  if (data.achievements.some((a) => a.title)) {
    lines.push('ACHIEVEMENTS');
    for (const ach of data.achievements) {
      if (ach.title) { lines.push(ach.title); if (ach.description) lines.push(ach.description); lines.push(''); }
    }
  }
  return lines.join('\n');
}

function formatResumeAsHTML(data: ResumeData, template: typeof TEMPLATES[0]): string {
  const c = template.colors;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${data.name} - Resume</title><style>
  body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; color: ${c.text}; }
  h1 { color: ${c.primary}; margin: 0 0 5px 0; font-size: 28px; }
  .contact { font-size: 13px; color: ${c.light}; margin-bottom: 20px; }
  h2 { color: ${c.primary}; font-size: 16px; text-transform: uppercase; border-bottom: 1px solid ${c.accent}; padding-bottom: 3px; margin: 20px 0 10px 0; }
  .exp-item { margin-bottom: 12px; }
  .exp-title { font-weight: bold; font-size: 14px; }
  .exp-date { font-size: 12px; color: ${c.light}; }
  .exp-desc { font-size: 13px; margin-top: 3px; }
  .skills { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill { background: ${c.accent}20; color: ${c.primary}; padding: 3px 10px; border-radius: 4px; font-size: 12px; }
</style></head><body>
  <h1>${data.name}</h1>
  <div class="contact">${[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).join(' | ')}</div>
  ${data.summary ? `<h2>Summary</h2><p>${data.summary}</p>` : ''}
  ${data.experience.some((e) => e.role || e.company) ? '<h2>Experience</h2>' + data.experience.filter((e) => e.role || e.company).map((e) => `<div class="exp-item"><div class="exp-title">${e.role}${e.company ? ' - ' + e.company : ''}</div><div class="exp-date">${e.startDate} - ${e.endDate}</div>${e.description ? `<div class="exp-desc">${e.description}</div>` : ''}</div>`).join('') : ''}
  ${data.education.some((e) => e.degree || e.institution) ? '<h2>Education</h2>' + data.education.filter((e) => e.degree || e.institution).map((e) => `<div class="exp-item"><div class="exp-title">${e.degree}${e.institution ? ' - ' + e.institution : ''}</div><div class="exp-date">${e.startDate} - ${e.endDate}</div>${e.description ? `<div class="exp-desc">${e.description}</div>` : ''}</div>`).join('') : ''}
  ${data.skills.length > 0 ? `<h2>Skills</h2><div class="skills">${data.skills.map((s) => `<span class="skill">${s}</span>`).join('')}</div>` : ''}
  ${data.projects.some((p) => p.name) ? '<h2>Projects</h2>' + data.projects.filter((p) => p.name).map((p) => `<div class="exp-item"><div class="exp-title">${p.name}</div>${p.description ? `<div class="exp-desc">${p.description}</div>` : ''}${p.link ? `<div class="exp-desc">${p.link}</div>` : ''}</div>`).join('') : ''}
  ${data.certifications.length > 0 ? `<h2>Certifications</h2><ul>${data.certifications.map((c2) => `<li>${c2}</li>`).join('')}</ul>` : ''}
  ${data.achievements.some((a) => a.title) ? '<h2>Achievements</h2>' + data.achievements.filter((a) => a.title).map((a) => `<div class="exp-item"><div class="exp-title">${a.title}</div>${a.description ? `<div class="exp-desc">${a.description}</div>` : ''}</div>`).join('') : ''}
</body></html>`;
}

const ResumePreview = forwardRef<HTMLDivElement, { data: ResumeData; template: typeof TEMPLATES[0] }>(
  function ResumePreview({ data, template }, ref) {
    const c = template.colors;
    const contactItems = [data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean);

    return (
      <div
        ref={ref}
        className="bg-white"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm 18mm',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: c.text,
          fontSize: '11pt',
          lineHeight: '1.5',
        }}
      >
        {/* Header - Name and Contact */}
        <div style={{ textAlign: 'center', borderBottom: `2px solid ${c.primary}`, paddingBottom: '10px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24pt', fontWeight: 700, color: c.primary, margin: 0, letterSpacing: '1px', fontFamily: 'Georgia, serif' }}>
            {data.name || 'YOUR NAME'}
          </h1>
          {contactItems.length > 0 && (
            <div style={{ fontSize: '9.5pt', color: c.light, marginTop: '5px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {contactItems.map((item, i) => (
                <span key={i}>
                  {item}
                  {i < contactItems.length - 1 && <span style={{ margin: '0 4px' }}>|</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {data.summary && (
          <Section title="Professional Summary" color={c}>
            <p style={{ margin: 0, fontSize: '10.5pt', textAlign: 'justify' }}>{data.summary}</p>
          </Section>
        )}

        {/* Experience */}
        {data.experience.some((e) => e.role || e.company) && (
          <Section title="Work Experience" color={c}>
            {data.experience.filter((e) => e.role || e.company).map((exp) => (
              <div key={exp.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '11pt', color: c.text }}>
                    {exp.role}{exp.company ? `, ${exp.company}` : ''}
                  </span>
                  <span style={{ fontSize: '9.5pt', color: c.light, fontStyle: 'italic' }}>
                    {exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : ''}
                  </span>
                </div>
                {exp.description && (
                  <p style={{ margin: '3px 0 0 0', fontSize: '10pt', color: c.text }}>{exp.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Education */}
        {data.education.some((e) => e.degree || e.institution) && (
          <Section title="Education" color={c}>
            {data.education.filter((e) => e.degree || e.institution).map((edu) => (
              <div key={edu.id} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '11pt' }}>
                    {edu.degree}{edu.institution ? `, ${edu.institution}` : ''}
                  </span>
                  <span style={{ fontSize: '9.5pt', color: c.light, fontStyle: 'italic' }}>
                    {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ''}
                  </span>
                </div>
                {edu.description && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '10pt', color: c.light }}>{edu.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <Section title="Skills" color={c}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.map((skill) => (
                <span key={skill} style={{
                  background: c.accent + '18',
                  color: c.primary,
                  padding: '3px 10px',
                  borderRadius: '3px',
                  fontSize: '10pt',
                  fontWeight: 500,
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {data.projects.some((p) => p.name) && (
          <Section title="Projects" color={c}>
            {data.projects.filter((p) => p.name).map((proj) => (
              <div key={proj.id} style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '11pt' }}>{proj.name}</span>
                {proj.link && <span style={{ fontSize: '9.5pt', color: c.light, marginLeft: '8px' }}>{proj.link}</span>}
                {proj.description && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '10pt' }}>{proj.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <Section title="Certifications" color={c}>
            <ul style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
              {data.certifications.map((cert, i) => (
                <li key={i} style={{ fontSize: '10.5pt', marginBottom: '3px' }}>{cert}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* Achievements */}
        {data.achievements.some((a) => a.title) && (
          <Section title="Achievements" color={c}>
            {data.achievements.filter((a) => a.title).map((ach) => (
              <div key={ach.id} style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '11pt' }}>{ach.title}</span>
                {ach.description && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '10pt' }}>{ach.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}
      </div>
    );
  }
);

function Section({ title, color, children }: { title: string; color: typeof TEMPLATES[0]['colors']; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <h2 style={{
        fontSize: '12pt',
        fontWeight: 700,
        color: color.primary,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        borderBottom: `1px solid ${color.accent}40`,
        paddingBottom: '4px',
        marginBottom: '8px',
        fontFamily: 'Georgia, serif',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
