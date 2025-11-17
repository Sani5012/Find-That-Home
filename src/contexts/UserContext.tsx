import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as SupabaseAuthUser, Session, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { initializeStorage } from '../utils/localStorage';

export type UserRole = 'tenant' | 'landlord' | 'buyer' | 'agent' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  income?: number;
  incomeType?: 'monthly' | 'yearly';
  preferredPropertyType?: 'rent' | 'buy';
  createdAt?: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  income?: number;
  incomeType?: 'monthly' | 'yearly';
  preferredPropertyType?: 'rent' | 'buy';
}

interface UserContextType {
  user: UserProfile | null;
  login: (email: string, password: string, role: UserRole) => Promise<UserProfile>;
  signup: (payload: SignupPayload) => Promise<{ requiresVerification: boolean }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

interface UserTableRow {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  income?: number | null;
  income_type?: 'monthly' | 'yearly' | null;
  preferred_property_type?: 'rent' | 'buy' | null;
  created_at?: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileTableAvailable, setProfileTableAvailable] = useState(true);

  const getEmailRedirectUrl = () => {
    const configuredUrl = import.meta.env.VITE_APP_URL;
    if (configuredUrl) {
      return `${configuredUrl.replace(/\/$/, '')}/login`;
    }

    if (typeof window !== 'undefined') {
      return `${window.location.origin}/login`;
    }

    return undefined;
  };

  useEffect(() => {
    initializeStorage();

    const initializeSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const profile = await loadUserProfile(data.session.user);
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to restore session', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleSessionChange(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSessionChange = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    try {
      const profile = await loadUserProfile(session.user);
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile', error);
    }
  };

  const loadUserProfile = async (authUser: SupabaseAuthUser): Promise<UserProfile> => {
    const profileData = await fetchProfileRow(authUser.id);
    return mapProfile(authUser, profileData || undefined);
  };

  const fetchProfileRow = async (userId: string) => {
    if (!profileTableAvailable) {
      return undefined;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116' || isIgnorableProfileError(error)) {
          if (isIgnorableProfileError(error)) {
            setProfileTableAvailable(false);
          }
          return undefined;
        }

        throw error;
      }

      return data ?? undefined;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('Supabase profile fetch failed, falling back to metadata', error);
        setProfileTableAvailable(false);
        return undefined;
      }

      throw error;
    }
  };

  const syncProfileRow = async (payload: Partial<UserTableRow>) => {
    if (!profileTableAvailable) {
      return;
    }

    try {
      const { error } = await supabase.from('users').upsert(payload);

      if (error) {
        if (isIgnorableProfileError(error)) {
          setProfileTableAvailable(false);
          console.warn('users table not available, continuing with auth metadata only');
          return;
        }

        throw error;
      }
    } catch (error) {
      if (isNetworkError(error)) {
        setProfileTableAvailable(false);
        console.warn('Network error while syncing profile, continuing with auth metadata only');
        return;
      }

      throw error;
    }
  };

  const mapProfile = (authUser: SupabaseAuthUser, profile?: UserTableRow): UserProfile => {
    const firstName = profile?.first_name || (authUser.user_metadata?.first_name as string | undefined) || '';
    const lastName = profile?.last_name || (authUser.user_metadata?.last_name as string | undefined) || '';
    const nameFromMetadata =
      (authUser.user_metadata?.full_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined);
    const metadataIncomeType =
      (authUser.user_metadata?.incomeType as 'monthly' | 'yearly' | undefined) ||
      (authUser.user_metadata?.income_type as 'monthly' | 'yearly' | undefined);
    const metadataPreferredPropertyType =
      (authUser.user_metadata?.preferredPropertyType as 'rent' | 'buy' | undefined) ||
      (authUser.user_metadata?.preferred_property_type as 'rent' | 'buy' | undefined);
    const computedName = `${firstName} ${lastName}`.trim();

    return {
      id: authUser.id,
      email: authUser.email || profile?.email || '',
      role: (profile?.role || (authUser.user_metadata?.role as UserRole) || 'tenant'),
      name: computedName || nameFromMetadata || profile?.email || authUser.email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: profile?.phone || (authUser.user_metadata?.phone as string | undefined),
      income: profile?.income ?? (authUser.user_metadata?.income as number | undefined),
      incomeType: profile?.income_type || metadataIncomeType || undefined,
      preferredPropertyType: profile?.preferred_property_type || metadataPreferredPropertyType || undefined,
      createdAt: profile?.created_at || authUser.created_at,
    };
  };

  const login = async (email: string, password: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error('Email not confirmed');
    }

    const profile = await loadUserProfile(data.user);

    if (profile.role !== 'admin' && profile.role !== role) {
      await supabase.auth.signOut();
      throw new Error(`This account is registered as a ${profile.role}, not a ${role}`);
    }

    setUser(profile);
    return profile;
  };

  const signup = async (payload: SignupPayload) => {
    const { email, password, firstName, lastName, phone, role, income, incomeType, preferredPropertyType } = payload;

    const emailRedirectTo = getEmailRedirectUrl();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
          income,
          income_type: incomeType,
          preferred_property_type: preferredPropertyType,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      await syncProfileRow({
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        income,
        income_type: incomeType,
        preferred_property_type: preferredPropertyType,
      });
    }

    if (data.session?.user?.email_confirmed_at) {
      const profile = await loadUserProfile(data.session.user);
      setUser(profile);
      return { requiresVerification: false };
    }

    return { requiresVerification: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const payload: Record<string, any> = {};
    if (updates.firstName !== undefined) payload.first_name = updates.firstName;
    if (updates.lastName !== undefined) payload.last_name = updates.lastName;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.income !== undefined) payload.income = updates.income;
    if (updates.incomeType !== undefined) payload.income_type = updates.incomeType;
    if (updates.preferredPropertyType !== undefined) payload.preferred_property_type = updates.preferredPropertyType;
    if (updates.name !== undefined) {
      const [first, ...rest] = updates.name.split(' ');
      payload.first_name = payload.first_name ?? first;
      payload.last_name = payload.last_name ?? rest.join(' ');
    }

    if (Object.keys(payload).length === 0) return;

    let profileData: UserTableRow | undefined;
    if (profileTableAvailable) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(payload)
          .eq('id', user.id)
          .select('*')
          .maybeSingle();

        if (error) {
          if (isIgnorableProfileError(error)) {
            console.warn('users table not available for updates, skipping');
            setProfileTableAvailable(false);
          } else {
            throw error;
          }
        } else {
          profileData = data ?? undefined;
        }
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn('Network error while updating profile, skipping table sync');
          setProfileTableAvailable(false);
        } else {
          throw error;
        }
      }
    }

    await supabase.auth.updateUser({
      data: {
        ...payload,
        incomeType: updates.incomeType,
        preferredPropertyType: updates.preferredPropertyType,
      },
    });

    const session = await supabase.auth.getSession();
    if (session.data.session?.user) {
      const refreshed = mapProfile(session.data.session.user, profileData || undefined);
      setUser(refreshed);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    await updateUser(updates);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUser,
        updateUserProfile,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

const isNetworkError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error && typeof (error as { message?: string }).message === 'string'
    ? (error as { message: string }).message.toLowerCase()
    : '';
  return message.includes('fetch failed') || message.includes('failed to fetch') || message.includes('network request failed');
};

const isIgnorableProfileError = (error: PostgrestError | null) => {
  if (!error) return false;
  const message = (error.message || '').toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST301' ||
    error.code === 'PGRST302' ||
    message.includes('does not exist')
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
