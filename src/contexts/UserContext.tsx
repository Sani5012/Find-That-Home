import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as StoredUser } from '../utils/localStorage';
import {
  createUser as createStoredUser,
  getUserByEmail,
  getUserById,
  initializeStorage,
  updateUser as updateStoredUser,
} from '../utils/localStorage';

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

const UserContext = createContext<UserContextType | undefined>(undefined);

const mapStoredUserToProfile = (stored: StoredUser): UserProfile => {
  const computedName = `${stored.firstName || ''} ${stored.lastName || ''}`.trim();

  return {
    id: stored.id,
    email: stored.email,
    role: stored.role,
    name: stored.name || computedName || stored.email,
    firstName: stored.firstName,
    lastName: stored.lastName,
    phone: stored.phone,
    income: stored.income,
    incomeType: stored.incomeType,
    preferredPropertyType: stored.preferredPropertyType,
    createdAt: stored.createdAt,
  };
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();

    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const storedId = localStorage.getItem('currentUserId');
    if (storedId) {
      const storedUser = getUserById(storedId);
      if (storedUser) {
        setUser(mapStoredUserToProfile(storedUser));
      } else {
        localStorage.removeItem('currentUserId');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const storedUser = getUserByEmail(email);

    if (!storedUser || storedUser.password !== password) {
      throw new Error('Invalid email or password');
    }

    if (storedUser.role !== 'admin' && storedUser.role !== role) {
      throw new Error(`This account is registered as a ${storedUser.role}, not a ${role}`);
    }

    localStorage.setItem('currentUserId', storedUser.id);
    const profile = mapStoredUserToProfile(storedUser);
    setUser(profile);
    return profile;
  };

  const signup = async (payload: SignupPayload) => {
    const existingUser = getUserByEmail(payload.email);
    if (existingUser) {
      throw new Error('This email is already registered. Please sign in instead.');
    }

    const computedName = `${payload.firstName} ${payload.lastName}`.trim() || payload.email;
    const newUser = createStoredUser({
      email: payload.email,
      password: payload.password,
      name: computedName,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      role: payload.role,
      income: payload.income,
      incomeType: payload.incomeType,
      preferredPropertyType: payload.preferredPropertyType,
    });

    localStorage.setItem('currentUserId', newUser.id);
    const profile = mapStoredUserToProfile(newUser);
    setUser(profile);

    return { requiresVerification: false };
  };

  const logout = async () => {
    localStorage.removeItem('currentUserId');
    setUser(null);
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const updatesForStorage: Record<string, unknown> = {};

    if (updates.firstName !== undefined) updatesForStorage.firstName = updates.firstName;
    if (updates.lastName !== undefined) updatesForStorage.lastName = updates.lastName;
    if (updates.phone !== undefined) updatesForStorage.phone = updates.phone;
    if (updates.role !== undefined) updatesForStorage.role = updates.role;
    if (updates.income !== undefined) updatesForStorage.income = updates.income;
    if (updates.incomeType !== undefined) updatesForStorage.incomeType = updates.incomeType;
    if (updates.preferredPropertyType !== undefined) {
      updatesForStorage.preferredPropertyType = updates.preferredPropertyType;
    }
    if (updates.name !== undefined) {
      updatesForStorage.name = updates.name;
      if (!updates.firstName || !updates.lastName) {
        const [first, ...rest] = updates.name.split(' ');
        updatesForStorage.firstName = updatesForStorage.firstName ?? first;
        updatesForStorage.lastName = updatesForStorage.lastName ?? rest.join(' ');
      }
    }

    if (Object.keys(updatesForStorage).length === 0) return;

    const updatedRecord = updateStoredUser(user.id, updatesForStorage);
    if (!updatedRecord) {
      throw new Error('Failed to update profile');
    }

    setUser(mapStoredUserToProfile(updatedRecord));
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
