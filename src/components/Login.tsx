import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Phone, Shield, ArrowRight, Loader2, RefreshCw, User, Sparkles } from 'lucide-react';

type Stage = 'phone' | 'otp' | 'name';

export default function Login() {
  const { sendOTP, verifyOTP, createProfile, pendingPhone, isNewUser, setIsNewUser } = useAuth();
  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const demoOTP = localStorage.getItem('aura_demo_otp') || '';

  function startResendCooldown() {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendOTP() {
    setError('');
    setLoading(true);
    const result = await sendOTP(phone);
    setLoading(false);
    if (result.success) {
      setStage('otp');
      startResendCooldown();
    } else {
      setError(result.error || 'Something went wrong');
    }
  }

  async function handleVerifyOTP() {
    setError('');
    setLoading(true);
    const result = await verifyOTP(pendingPhone || phone, otp);
    setLoading(false);
    if (result.success) {
      if (result.existing) {
        // existing user - profile is set, app will redirect
      } else {
        setStage('name');
      }
    } else {
      setError(result.error || 'Verification failed');
    }
  }

  async function handleResendOTP() {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    const result = await sendOTP(phone);
    setLoading(false);
    if (result.success) {
      startResendCooldown();
    } else {
      setError(result.error || 'Failed to resend');
    }
  }

  async function handleCreateProfile() {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');
    setLoading(true);
    const result = await createProfile(name);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to create profile');
    }
  }

  function handleBack() {
    setStage('phone');
    setOtp('');
    setError('');
    setIsNewUser(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-40" />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-lg shadow-blue-200 mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AURA AI</h1>
        <p className="text-gray-500 mt-2 text-sm">Your AI-powered resume analyzer</p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          {stage === 'phone' && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
                <p className="text-gray-500 text-sm mt-1">Enter your phone number to get started</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={loading || !phone}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify Your Number
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {stage === 'otp' && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Enter OTP</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sent to {pendingPhone || phone}
                </p>
              </div>

              {demoOTP && (
                <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Demo OTP:</span> {demoOTP}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-[0.5em] font-semibold"
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={handleBack}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      ← Change number
                    </button>
                    <button
                      onClick={handleResendOTP}
                      disabled={resendCooldown > 0}
                      className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors flex items-center gap-1"
                    >
                      {resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Resend OTP
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
                )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
              </div>
            </>
          )}

          {stage === 'name' && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">What's your name?</h2>
                <p className="text-gray-500 text-sm mt-1">This will be shown on your profile</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
                )}

                <button
                  onClick={handleCreateProfile}
                  disabled={loading || !name.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create Profile
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to AURA AI's Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}
