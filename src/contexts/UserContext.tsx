import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  initializeStorage,
  getUserByEmail,
  createUser,
  updateUser as updateUserInStorage,
  User
} from '../utils/localStorage';

export type UserRole = 'tenant' | 'landlord' | 'buyer' | 'agent' | 'admin';

interface UserContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (email: string, password: string, name: string, phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize localStorage and check for existing session
  useEffect(() => {
    initializeStorage();
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const sessionData = localStorage.getItem('currentUser');
      if (sessionData) {
        const userData = JSON.parse(sessionData);
        setUser(userData);
        localStorage.setItem('currentUserId', userData.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserId');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const foundUser = getUserByEmail(email);

        if (!foundUser) {
          reject(new Error('User not found'));
          return;
        }

        if (foundUser.password !== password) {
          reject(new Error('Invalid email or password'));
          return;
        }

        // Allow admins to login with any role selection
        // For other users, check if role matches
        if (foundUser.role !== 'admin' && foundUser.role !== role) {
          reject(new Error(`This account is registered as a ${foundUser.role}, not a ${role}`));
          return;
        }

        // Store session
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        localStorage.setItem('currentUserId', foundUser.id);
        setUser(foundUser);
        resolve();
      } catch (error: any) {
        console.error('Login error:', error);
        reject(error);
      }
    });
  };

  const signup = async (email: string, password: string, name: string, phone: string, role: UserRole) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Check if user already exists
        const existingUser = getUserByEmail(email);
        if (existingUser) {
          reject(new Error('An account with this email already exists'));
          return;
        }

        // Create new user
        const newUser = createUser({
          email,
          password,
          name,
          phone,
          role,
        });

        // Store session
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('currentUserId', newUser.id);
        setUser(newUser);
        resolve();
      } catch (error: any) {
        console.error('Signup error:', error);
        reject(error);
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserId');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = updateUserInStorage(user.id, updates);
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };
  
  const updateUserProfile = (updates: Partial<User>) => {
    // Alias for updateUser - same functionality
    updateUser(updates);
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