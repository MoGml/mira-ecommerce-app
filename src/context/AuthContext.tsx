import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  walletBalance?: number;
  isRegistered: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser: boolean; error?: string }>;
  register: (name: string, email: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkPhoneNumber: (phone: string) => Promise<{ exists: boolean; userName?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@mira_user';

// Mock data - replace with API calls later
const REGISTERED_USERS: { [phone: string]: User } = {
  '01019233560': {
    id: '1',
    name: 'Mostafa',
    phone: '01019233560',
    email: 'mostafa@example.com',
    walletBalance: 150.0,
    isRegistered: true,
  },
};

const VALID_OTP = '1111';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const checkPhoneNumber = async (phone: string): Promise<{ exists: boolean; userName?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const registeredUser = REGISTERED_USERS[phone];
    if (registeredUser) {
      return {
        exists: true,
        userName: registeredUser.name,
      };
    }
    
    return { exists: false };
  };

  const login = async (phone: string, otp: string): Promise<{ success: boolean; isNewUser: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (otp !== VALID_OTP) {
      return {
        success: false,
        isNewUser: false,
        error: 'Invalid OTP code',
      };
    }

    const registeredUser = REGISTERED_USERS[phone];
    
    if (registeredUser) {
      // Existing user
      await saveUser(registeredUser);
      return {
        success: true,
        isNewUser: false,
      };
    } else {
      // New user - return success but indicate they need to complete profile
      return {
        success: true,
        isNewUser: true,
      };
    }
  };

  const register = async (name: string, email: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      walletBalance: 0,
      isRegistered: true,
    };

    await saveUser(newUser);
    
    return { success: true };
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkPhoneNumber,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

