import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { initializeStorage } from '../utils/localStorage';
import { supabase } from '../lib/supabaseClient';

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
  monthlyDebts?: number;
  savings?: number;
  creditScore?: 'excellent' | 'good' | 'fair' | 'poor';
  affordabilityResult?: unknown;
  monthlyIncome?: number;
  agencyName?: string;
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

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UsersTableRow {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  income?: number;
  income_type?: 'monthly' | 'yearly';
  preferred_property_type?: 'rent' | 'buy';
  created_at?: string;
}

interface AgentTableRow {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  agency_name?: string;
}

const USER_SELECT_FIELDS = `id, email, role, name, first_name, last_name, phone, income, income_type, preferred_property_type, created_at`;

const normalizeMetadata = (metadata: Record<string, any> = {}) => ({
  firstName: metadata.first_name ?? metadata.firstName,
  lastName: metadata.last_name ?? metadata.lastName,
  phone: metadata.phone ?? metadata.phone_number,
  income: metadata.income,
  incomeType: metadata.income_type ?? metadata.incomeType,
  preferredPropertyType: metadata.preferred_property_type ?? metadata.preferredPropertyType,
  role: metadata.role as UserRole | undefined,
  monthlyDebts: metadata.monthlyDebts,
  savings: metadata.savings,
  creditScore: metadata.creditScore,
  affordabilityResult: metadata.affordabilityResult,
  monthlyIncome: metadata.monthlyIncome,
  agencyName: metadata.agency_name ?? metadata.agencyName,
});

const mapRecordToProfile = (
  authUser: SupabaseAuthUser,
  record: UsersTableRow | null,
  metadataOverrides?: Partial<UserProfile>
): UserProfile => {
  const metadata = normalizeMetadata(authUser.user_metadata);
  const mergedMetadata = { ...metadata, ...metadataOverrides };

  const firstName = record?.first_name ?? mergedMetadata.firstName;
  const lastName = record?.last_name ?? mergedMetadata.lastName;
  const nameFromRecord = record?.name;
  const computedName = `${firstName || ''} ${lastName || ''}`.trim();
  const fallbackName = mergedMetadata.name ?? (computedName || authUser.email || 'User');

  return {
    id: record?.id ?? authUser.id,
    email: record?.email ?? authUser.email ?? '',
    role: (record?.role ?? mergedMetadata.role ?? 'tenant') as UserRole,
    name: nameFromRecord ?? fallbackName,
    firstName,
    lastName,
    phone: record?.phone ?? mergedMetadata.phone,
    income: record?.income ?? mergedMetadata.income,
    incomeType: record?.income_type ?? mergedMetadata.incomeType,
    preferredPropertyType: record?.preferred_property_type ?? mergedMetadata.preferredPropertyType,
    createdAt: record?.created_at ?? authUser.created_at ?? undefined,
    monthlyDebts: mergedMetadata.monthlyDebts,
    savings: mergedMetadata.savings,
    creditScore: mergedMetadata.creditScore,
    affordabilityResult: mergedMetadata.affordabilityResult,
    monthlyIncome: mergedMetadata.monthlyIncome,
    agencyName: mergedMetadata.agencyName,
  };
};

const syncAgentRecord = async (profile: UserProfile) => {
  if (profile.role !== 'agent') return;

  try {
    const agentPayload = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? null,
      agency_name: profile.agencyName ?? 'Independent Agent',
    };

    const { data: existingAgent, error: fetchError } = await supabase
      .from<AgentTableRow>('agents')
      .select('id')
      .eq('email', profile.email)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('Failed to look up agent profile:', fetchError.message);
      return;
    }

    if (existingAgent) {
      await supabase.from('agents').update(agentPayload).eq('id', existingAgent.id);
    } else {
      await supabase.from('agents').insert(agentPayload);
    }
  } catch (error) {
    console.warn('Agent table sync skipped:', error);
  }
};

const fetchOrCreateProfileRecord = async (
  authUser: SupabaseAuthUser,
  fallbackRole?: UserRole
): Promise<UsersTableRow | null> => {
  const { data, error } = await supabase
    .from<UsersTableRow>('users')
    .select(USER_SELECT_FIELDS)
    .eq('id', authUser.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  if (data) {
    return data;
  }

  const metadata = normalizeMetadata(authUser.user_metadata);
  const metadataComputedName = `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim();
  const name = metadata.name ?? (metadataComputedName || authUser.email || 'User');

  const insertPayload = {
    id: authUser.id,
    email: authUser.email,
    role: metadata.role ?? fallbackRole ?? 'tenant',
    first_name: metadata.firstName ?? null,
    last_name: metadata.lastName ?? null,
    phone: metadata.phone ?? null,
    income: metadata.income ?? null,
    income_type: metadata.incomeType ?? null,
    preferred_property_type: metadata.preferredPropertyType ?? null,
    name,
    created_at: authUser.created_at ?? new Date().toISOString(),
  } satisfies Partial<UsersTableRow>;

  const { data: inserted, error: insertError } = await supabase
    .from<UsersTableRow>('users')
    .upsert(insertPayload)
    .select(USER_SELECT_FIELDS)
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return inserted;
};

const fetchProfileForAuthUser = async (
  authUser: SupabaseAuthUser,
  fallbackRole?: UserRole,
  metadataOverrides?: Partial<UserProfile>
): Promise<UserProfile> => {
  const record = await fetchOrCreateProfileRecord(authUser, fallbackRole);
  const profile = mapRecordToProfile(authUser, record, metadataOverrides);

  try {
    await syncAgentRecord(profile);
  } catch (error) {
    console.warn('Agent sync skipped:', error);
  }

  return profile;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const persistCurrentUser = (profile: UserProfile | null) => {
    if (typeof window === 'undefined') return;

    if (profile) {
      localStorage.setItem('currentUserId', profile.id);
      localStorage.setItem('currentUserName', profile.name ?? profile.email);
      localStorage.setItem('currentUserEmail', profile.email);
    } else {
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('currentUserName');
      localStorage.removeItem('currentUserEmail');
    }
  };

  useEffect(() => {
    initializeStorage();
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        const authUser = data.session?.user;
        if (authUser && isMounted) {
          const profile = await fetchProfileForAuthUser(authUser);
          if (isMounted) {
            setUser(profile);
            persistCurrentUser(profile);
          }
        } else if (isMounted) {
          setUser(null);
          persistCurrentUser(null);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        if (isMounted) {
          setUser(null);
          persistCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    hydrateSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const authUser = session?.user;
      if (authUser) {
        setLoading(true);
        fetchProfileForAuthUser(authUser)
          .then((profile) => {
            if (isMounted) {
              setUser(profile);
              persistCurrentUser(profile);
            }
          })
          .catch((error) => {
            console.error('Auth state sync failed:', error);
            if (isMounted) {
              setUser(null);
              persistCurrentUser(null);
            }
          })
          .finally(() => {
            if (isMounted) {
              setLoading(false);
            }
          });
      } else {
        setUser(null);
        persistCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email or password');
    }

    const authUser = data.user;

    if (!authUser.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error('Email not confirmed');
    }

    const profile = await fetchProfileForAuthUser(authUser, role);

    if (profile.role !== 'admin' && profile.role !== role) {
      throw new Error(`This account is registered as a ${profile.role}, not a ${role}`);
    }

    setUser(profile);
    persistCurrentUser(profile);
    return profile;
  };

  const signup = async (payload: SignupPayload) => {
    const metadata = {
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone,
      role: payload.role,
      income: payload.income,
      income_type: payload.incomeType,
      preferred_property_type: payload.preferredPropertyType,
    };

    const emailRedirectTo = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: metadata,
        emailRedirectTo,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const authUser = data.user;
    const name = `${payload.firstName} ${payload.lastName}`.trim() || payload.email;

    if (authUser) {
      const { error: upsertError } = await supabase.from('users').upsert({
        id: authUser.id,
        email: payload.email,
        role: payload.role,
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
        income: payload.income,
        income_type: payload.incomeType,
        preferred_property_type: payload.preferredPropertyType,
        name,
        created_at: authUser.created_at ?? new Date().toISOString(),
      });

      if (upsertError) {
        console.error('Failed to persist profile:', upsertError.message);
      }

      if (payload.role === 'agent') {
        try {
          await syncAgentRecord({
            id: authUser.id,
            email: payload.email,
            role: payload.role,
            name,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            income: payload.income,
            incomeType: payload.incomeType,
            preferredPropertyType: payload.preferredPropertyType,
            createdAt: authUser.created_at ?? new Date().toISOString(),
            agencyName: undefined,
          });
        } catch (agentError) {
          console.warn('Agent record sync failed during signup:', agentError);
        }
      }
    }

    const requiresVerification = !data.session?.user?.email_confirmed_at;

    if (!requiresVerification && data.session?.user) {
      const profile = await fetchProfileForAuthUser(data.session.user, payload.role);
      setUser(profile);
      persistCurrentUser(profile);
    }

    return { requiresVerification };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    persistCurrentUser(null);
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const tableUpdates: Record<string, unknown> = {};
    const metadataUpdates: Record<string, unknown> = {};

    if (updates.firstName !== undefined) {
      tableUpdates.first_name = updates.firstName;
      metadataUpdates.first_name = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      tableUpdates.last_name = updates.lastName;
      metadataUpdates.last_name = updates.lastName;
    }
    if (updates.name !== undefined) {
      tableUpdates.name = updates.name;
      metadataUpdates.name = updates.name;
    }
    if (updates.phone !== undefined) {
      tableUpdates.phone = updates.phone;
      metadataUpdates.phone = updates.phone;
    }
    if (updates.role !== undefined) {
      tableUpdates.role = updates.role;
      metadataUpdates.role = updates.role;
    }
    if (updates.income !== undefined) {
      tableUpdates.income = updates.income;
      metadataUpdates.income = updates.income;
    }
    if (updates.incomeType !== undefined) {
      tableUpdates.income_type = updates.incomeType;
      metadataUpdates.income_type = updates.incomeType;
    }
    if (updates.preferredPropertyType !== undefined) {
      tableUpdates.preferred_property_type = updates.preferredPropertyType;
      metadataUpdates.preferred_property_type = updates.preferredPropertyType;
    }

    const metadataOnlyFields: (keyof UserProfile)[] = [
      'monthlyDebts',
      'savings',
      'creditScore',
      'affordabilityResult',
      'monthlyIncome',
      'agencyName',
    ];

    for (const field of metadataOnlyFields) {
      if (field in updates) {
        metadataUpdates[field] = updates[field];
      }
    }

    if (Object.keys(tableUpdates).length > 0) {
      const { error } = await supabase
        .from('users')
        .update(tableUpdates)
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message || 'Failed to update profile');
      }
    }

    if (Object.keys(metadataUpdates).length > 0) {
      const { error } = await supabase.auth.updateUser({ data: metadataUpdates });
      if (error) {
        console.error('Auth metadata update failed:', error.message);
      }
    }

    const refreshedUser = await supabase.auth.getUser();
    if (refreshedUser.data.user) {
      const profile = await fetchProfileForAuthUser(refreshedUser.data.user);
      setUser(profile);
      persistCurrentUser(profile);
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

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
