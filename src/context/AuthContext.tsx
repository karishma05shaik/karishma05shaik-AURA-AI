import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { generateOTP, formatPhone, validatePhone } from '@/lib/utils';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, code: string) => Promise<{ success: boolean; error?: string; existing?: boolean }>;
  createProfile: (name: string) => Promise<{ success: boolean; error?: string }>;
  updateName: (name: string) => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (avatarUrl: string) => Promise<{ success: boolean; error?: string }>;
  changePhone: (newPhone: string) => Promise<{ success: boolean; error?: string }>;
  confirmChangePhone: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  pendingPhone: string | null;
  setPendingPhone: (phone: string | null) => void;
  pendingNewPhone: string | null;
  setPendingNewPhone: (phone: string | null) => void;
  isNewUser: boolean;
  setIsNewUser: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [pendingNewPhone, setPendingNewPhone] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('aura_profile_id');
    if (stored) {
      loadProfile(stored);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data && !error) {
      setProfile(data as Profile);
    } else {
      localStorage.removeItem('aura_profile_id');
    }
    setLoading(false);
  }

  async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
    if (!validatePhone(phone)) {
      return { success: false, error: 'Please enter a valid phone number' };
    }

    const formatted = formatPhone(phone);

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabase.from('otp_codes').insert({
      phone: formatted,
      code,
      expires_at: expiresAt,
      verified: false,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    localStorage.setItem('aura_demo_otp', code);
    localStorage.setItem('aura_pending_phone', formatted);
    setPendingPhone(formatted);

    return { success: true };
  }

  async function verifyOTP(phone: string, code: string): Promise<{ success: boolean; error?: string; existing?: boolean }> {
    const formatted = formatPhone(phone);

    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', formatted)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'No OTP found. Please request a new code.' };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: 'OTP has expired. Please request a new code.' };
    }

    if (data.code !== code) {
      return { success: false, error: 'Incorrect OTP. Please try again.' };
    }

    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', data.id);

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', formatted)
      .maybeSingle();

    if (existingProfile) {
      setProfile(existingProfile as Profile);
      localStorage.setItem('aura_profile_id', existingProfile.id);
      localStorage.removeItem('aura_demo_otp');
      localStorage.removeItem('aura_pending_phone');
      setPendingPhone(null);
      return { success: true, existing: true };
    }

    setIsNewUser(true);
    return { success: true, existing: false };
  }

  async function createProfile(name: string): Promise<{ success: boolean; error?: string }> {
    const phone = pendingPhone || localStorage.getItem('aura_pending_phone');
    if (!phone) {
      return { success: false, error: 'Phone verification expired. Please start over.' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({ phone, name })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    setProfile(data as Profile);
    localStorage.setItem('aura_profile_id', data.id);
    localStorage.removeItem('aura_demo_otp');
    localStorage.removeItem('aura_pending_phone');
    setPendingPhone(null);
    setIsNewUser(false);

    return { success: true };
  }

  async function updateName(name: string): Promise<{ success: boolean; error?: string }> {
    if (!profile) return { success: false, error: 'Not logged in' };

    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', profile.id);

    if (error) return { success: false, error: error.message };

    setProfile({ ...profile, name });
    return { success: true };
  }

  async function updateAvatar(avatarUrl: string): Promise<{ success: boolean; error?: string }> {
    if (!profile) return { success: false, error: 'Not logged in' };

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', profile.id);

    if (error) return { success: false, error: error.message };

    setProfile({ ...profile, avatar_url: avatarUrl });
    return { success: true };
  }

  async function changePhone(newPhone: string): Promise<{ success: boolean; error?: string }> {
    if (!profile) return { success: false, error: 'Not logged in' };

    const formatted = formatPhone(newPhone);

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', formatted)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'This number is already registered' };
    }

    setPendingNewPhone(formatted);
    return await sendOTP(formatted);
  }

  async function confirmChangePhone(code: string): Promise<{ success: boolean; error?: string }> {
    if (!profile || !pendingNewPhone) {
      return { success: false, error: 'No pending phone change' };
    }

    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', pendingNewPhone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'No OTP found' };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: 'OTP expired' };
    }

    if (data.code !== code) {
      return { success: false, error: 'Incorrect OTP' };
    }

    await supabase.from('otp_codes').update({ verified: true }).eq('id', data.id);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ phone: pendingNewPhone })
      .eq('id', profile.id);

    if (updateError) return { success: false, error: updateError.message };

    setProfile({ ...profile, phone: pendingNewPhone });
    setPendingNewPhone(null);
    localStorage.removeItem('aura_demo_otp');
    return { success: true };
  }

  function logout() {
    setProfile(null);
    localStorage.removeItem('aura_profile_id');
    localStorage.removeItem('aura_demo_otp');
    localStorage.removeItem('aura_pending_phone');
    setPendingPhone(null);
    setPendingNewPhone(null);
    setIsNewUser(false);
  }

  async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
    if (!profile) return { success: false, error: 'Not logged in' };

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profile.id);

    if (error) return { success: false, error: error.message };

    logout();
    return { success: true };
  }

  async function refreshProfile() {
    if (!profile) return;
    await loadProfile(profile.id);
  }

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        sendOTP,
        verifyOTP,
        createProfile,
        updateName,
        updateAvatar,
        changePhone,
        confirmChangePhone,
        logout,
        deleteAccount,
        refreshProfile,
        pendingPhone,
        setPendingPhone,
        pendingNewPhone,
        setPendingNewPhone,
        isNewUser,
        setIsNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
