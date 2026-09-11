import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem } from '@/types';
import {
  Plus, Trash2, Download, Share2, Edit3, FileDown, ChevronLeft, ChevronRight,
  Briefcase, GraduationCap, Wrench, FolderGit2, Award, User, Check,
} from 'lucide-react';

interface CreateResumeProps {
  editingResume?: any;
  onSaved: () => void;
  onCancel: () => void;
}

const TEMPLATES = [
  { id: 'modern', name: 'Modern', colors: { primary: '#2563eb', accent: '#3b82f6', bg: '#f8fafc' } },
  { id: 'classic', name: 'Classic', colors: { primary: '#1e293b', accent: '#475569', bg: '#ffffff' } },
  { id: 'elegant', name: 'Elegant', colors: { primary: '#0f766e', accent: '#14b8a6', bg: '#f0fdfa' } },
  { id: 'minimal', name: 'Minimal', colors: { primary: '#374151', accent: '#6b7280', bg: '#ffffff' } },
  { id: 'creative', name: 'Creative', colors: { primary: '#7c3aed', accent: '#8b5cf6', bg: '#faf5ff' } },
  { id: 'professional', name: 'Professional', colors: { primary: '#1e40af', accent: '#2563eb', bg: '#eff6ff' } },
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
  };
}

export default function CreateResume({ editingResume, onSaved, onCancel }: CreateResumeProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState<'details' | 'template' | 'preview'>('details');
  const [data, setData] = useState<ResumeData>(() => {
    if (editingResume?.data) {
      return editingResume.data;
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
    } catch (err) {
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

    pdf.download(`${title.replace(/\s+/g, '_')}.pdf`);
  }

  function handleExport(format: string) {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
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
      // Open share options
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
  ];

  const selectedTemplate = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-0">
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
                      placeholder="Write a brief professional summary..."
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
                            placeholder="Describe your responsibilities and achievements..."
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
                            placeholder="Additional details..."
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
                  <div className="aspect-[3/4] p-4" style={{ background: t.colors.bg }}>
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <ResumePreview data={data} template={selectedTemplate} ref={resumePreviewRef} />
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

import { forwardRef } from 'react';

const ResumePreview = forwardRef<HTMLDivElement, { data: ResumeData; template: typeof TEMPLATES[0] }>(
  function ResumePreview({ data, template }, ref) {
    const c = template.colors;
    return (
      <div ref={ref} className="p-8" style={{ background: c.bg }}>
        {/* Header */}
        <div className="border-b-2 pb-4 mb-4" style={{ borderColor: c.primary }}>
          <h1 className="text-3xl font-bold" style={{ color: c.primary }}>{data.name || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>• {data.phone}</span>}
            {data.location && <span>• {data.location}</span>}
            {data.linkedin && <span>• {data.linkedin}</span>}
            {data.website && <span>• {data.website}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-5">
            <h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: c.primary }}>Summary</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && data.experience.some((e) => e.role || e.company) && (
          <div className="mb-5">
            <h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: c.primary }}>Experience</h2>
            {data.experience.filter((e) => e.role || e.company).map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900 text-sm">{exp.role}{exp.company ? ` — ${exp.company}` : ''}</h3>
                  <span className="text-xs text-gray-500">{exp.startDate} {exp.endDate && `— ${exp.endDate}`}</span>
                </div>
                {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && data.education.some((e) => e.degree || e.institution) && (
          <div className="mb-5">
            <h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: c.primary }}>Education</h2>
            {data.education.filter((e) => e.degree || e.institution).map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}{edu.institution ? `, ${edu.institution}` : ''}</h3>
                  <span className="text-xs text-gray-500">{edu.startDate} {edu.endDate && `— ${edu.endDate}`}</span>
                </div>
                {edu.description && <p className="text-sm text-gray-600 mt-0.5">{edu.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: c.primary }}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded text-xs font-medium" style={{ background: c.accent + '20', color: c.primary }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && data.projects.some((p) => p.name) && (
          <div className="mb-5">
            <h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: c.primary }}>Projects</h2>
            {data.projects.filter((p) => p.name).map((proj) => (
              <div key={proj.id} className="mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {proj.name}
                  {proj.link && <span className="text-xs text-gray-500 ml-2">{proj.link}</span>}
                </h3>
                {proj.description && <p className="text-sm text-gray-600 mt-0.5">{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: c.primary }}>Certifications</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
              {data.certifications.map((cert) => (
                <li key={cert}>{cert}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
