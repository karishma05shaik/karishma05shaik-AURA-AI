import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';
import {
  Phone, User, LogOut, Trash2, Camera, Loader2, Shield,
  Check, ArrowLeft, AlertCircle,
} from 'lucide-react';

export default function Settings() {
  const { profile, updateName, updateAvatar, changePhone, confirmChangePhone, logout, deleteAccount } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Change name state
  const [newName, setNewName] = useState('');

  // Change phone state
  const [newPhone, setNewPhone] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [phoneStep, setPhoneStep] = useState<'enter' | 'verify'>('enter');

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');

  if (!profile) return null;

  async function handleChangeName() {
    if (!newName.trim()) {
      setError('Please enter a new name');
      return;
    }
    setError('');
    setLoading(true);
    const result = await updateName(newName);
    setLoading(false);
    if (result.success) {
      setActiveModal(null);
      setNewName('');
      setSuccess('Name updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to update name');
    }
  }

  async function handleChangePhone() {
    if (phoneStep === 'enter') {
      setError('');
      setLoading(true);
      const result = await changePhone(newPhone);
      setLoading(false);
      if (result.success) {
        setPhoneStep('verify');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } else {
      setError('');
      setLoading(true);
      const result = await confirmChangePhone(phoneOTP);
      setLoading(false);
      if (result.success) {
        setActiveModal(null);
        setNewPhone('');
        setPhoneOTP('');
        setPhoneStep('enter');
        setSuccess('Phone number updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to verify OTP');
      }
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    setError('');
    setLoading(true);
    const result = await deleteAccount();
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to delete account');
    }
  }

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
      setSuccess('Profile photo updated');
      setTimeout(() => setSuccess(''), 3000);
    };
    reader.readAsDataURL(file);
  }

  const demoOTP = activeModal === 'change-phone' && phoneStep === 'verify' ? localStorage.getItem('aura_demo_otp') : '';

  const settings = [
    { id: 'change-number', label: 'Change Number', icon: Phone, desc: 'Update your phone number', danger: false },
    { id: 'change-name', label: 'Change Name', icon: User, desc: 'Update your display name', danger: false },
    { id: 'logout', label: 'Log Out', icon: LogOut, desc: 'Sign out of your account', danger: false },
    { id: 'delete-account', label: 'Delete Account', icon: Trash2, desc: 'Permanently delete your account', danger: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-20 px-4 lg:px-8 py-3">
        <h1 className="text-lg font-semibold text-gray-900 ml-12 lg:ml-0">Settings</h1>
      </div>

      <div className="p-4 lg:p-8 pt-4 max-w-2xl mx-auto">
        {/* Success message */}
        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        )}

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                  {getInitials(profile.name)}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{profile.name}</p>
              <p className="text-sm text-gray-500">{profile.phone}</p>
              <label htmlFor="avatar-upload" className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer mt-1 inline-block">
                Change photo
              </label>
            </div>
          </div>
        </div>

        {/* Settings list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {settings.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id === 'logout') {
                    logout();
                  } else {
                    setActiveModal(s.id);
                    setError('');
                    if (s.id === 'change-name') setNewName(profile.name);
                  }
                }}
                className={`w-full flex items-center gap-4 p-4 text-left transition-all hover:bg-gray-50 ${
                  i !== settings.length - 1 ? 'border-b border-gray-100' : ''
                } ${s.danger ? 'text-red-600' : 'text-gray-900'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  s.danger ? 'bg-red-50' : 'bg-gray-100'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{s.label}</p>
                  <p className={`text-xs ${s.danger ? 'text-red-400' : 'text-gray-500'}`}>{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Change Name Modal */}
      {activeModal === 'change-name' && (
        <Modal title="Change Name" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleChangeName} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Name'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Phone Modal */}
      {activeModal === 'change-phone' && (
        <Modal title="Change Number" onClose={() => { setActiveModal(null); setPhoneStep('enter'); setNewPhone(''); setPhoneOTP(''); }}>
          <div className="space-y-4">
            {phoneStep === 'enter' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500">Current number: {profile.phone}</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-gray-900">Verify your new number</p>
                </div>
                <p className="text-sm text-gray-500 mb-3">OTP sent to {newPhone}</p>
                {demoOTP && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs text-blue-700"><span className="font-semibold">Demo OTP:</span> {demoOTP}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={phoneOTP}
                    onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-xl tracking-[0.3em] font-semibold"
                  />
                </div>
              </>
            )}
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { phoneStep === 'verify' ? setPhoneStep('enter') : setActiveModal(null); setPhoneOTP(''); setError(''); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                {phoneStep === 'verify' ? 'Back' : 'Cancel'}
              </button>
              <button onClick={handleChangePhone} disabled={loading || (phoneStep === 'enter' ? !newPhone : phoneOTP.length !== 6)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : phoneStep === 'enter' ? 'Send OTP' : 'Verify & Update'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {activeModal === 'delete-account' && (
        <Modal title="Delete Account" onClose={() => { setActiveModal(null); setDeleteConfirm(''); }}>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                This will permanently delete your account, all resumes, and analysis history. This action <span className="font-semibold text-red-600">cannot be undone</span>.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type DELETE to confirm</label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                placeholder="DELETE"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setActiveModal(null); setDeleteConfirm(''); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Forever'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
