import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AUTH_STATUS_KEY,
  AUTH_TOKEN_KEY,
  login as apiLogin,
  LoginRequest,
  Address,
  checkCustomerExist,
  editProfile,
  EditProfileRequest,
  customerRegister,
  CustomerRegisterRequest
} from '../services/api';
import { AppState } from 'react-native';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  walletBalance?: number;
  points?: number;
  isRegistered: boolean;
  selectedAddress?: Address | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsAddressSetup: boolean;
  login: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser: boolean; error?: string; needsAddressSetup?: boolean }>;
  register: (name: string, email: string, phone: string) => Promise<{ success: boolean; error?: string }>; // Deprecated - kept for backward compatibility
  editProfile: (name?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkPhoneNumber: (phone: string) => Promise<{ exists: boolean; userName?: string }>;
  completeGuestFlow: () => Promise<void>;
  updateSelectedAddress: (address: Address) => Promise<void>;
  refreshUser: () => Promise<void>;
  markAddressSetupComplete: () => void;
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
  const [needsAddressSetup, setNeedsAddressSetup] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Handle app state changes to check address validation
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && user?.isRegistered) {
        // App became active - check if user needs address setup
        if (!user.selectedAddress) {
          setNeedsAddressSetup(true);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [user]);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      const authStatus = await AsyncStorage.getItem(AUTH_STATUS_KEY);

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Sync selected address to AddressContext storage if it exists
        if (parsedUser.selectedAddress) {
          await AsyncStorage.setItem('@mira_selected_address', JSON.stringify(parsedUser.selectedAddress));
          console.log('✅ [AUTH] Synced existing user address to AddressContext on load');
        }

        // Check if logged-in user needs address setup
        if (parsedUser.isRegistered && !parsedUser.selectedAddress) {
          setNeedsAddressSetup(true);
        }
      } else if (authStatus === 'guest') {
        // Guest user - create a guest user object
        const guestUser: User = {
          id: 'guest',
          name: 'Guest User',
          phone: '',
          isRegistered: false,
        };
        setUser(guestUser);
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
    try {
      // Egypt country code - can be made dynamic later
      const countryCode = 20;
      const phoneNumber = phone.startsWith('0') ? phone.substring(1) : phone;

      console.log('📱 [AUTH] Checking phone number:', { phoneNumber, countryCode });

      const result = await checkCustomerExist(phoneNumber, countryCode);

      console.log('📱 [AUTH] Phone check result:', result);

      return {
        exists: result.exists,
        userName: undefined, // API doesn't return userName in CheckCustomerExist
      };
    } catch (error: any) {
      console.error('❌ [AUTH] Failed to check phone number:', error);
      // Return false on error to allow flow to continue
      return { exists: false };
    }
  };

  const login = async (phone: string, otp: string): Promise<{ success: boolean; isNewUser: boolean; error?: string; needsAddressSetup?: boolean }> => {
    try {
      // Extract country code and phone number
      // Assuming phone format like "01019233560" (Egypt)
      const countryCode = 20; // Egypt country code - can be made dynamic later
      const phoneNumber = phone.startsWith('0') ? phone.substring(1) : phone;

      // Prepare login request
      const loginRequest: LoginRequest = {
        fcmToken: undefined, // TODO: Replace with real FCM token from Firebase
        otp: otp,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
      };

      console.log('🔐 [AUTH] Logging in with:', { phoneNumber, countryCode });

      const response = await apiLogin(loginRequest);

      console.log('✅ [AUTH] Login successful:', response);

      // Store auth token
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);

      // Create user object from response
      const loggedInUser: User = {
        id: response.customerId.toString(),
        name: response.displayName,
        phone: response.phoneNumber,
        walletBalance: response.wallet,
        points: response.points,
        isRegistered: true,
        selectedAddress: response.selectedAddress,
      };

      await saveUser(loggedInUser);

      // Sync selected address to AddressContext storage
      if (response.selectedAddress) {
        await AsyncStorage.setItem('@mira_selected_address', JSON.stringify(response.selectedAddress));
        console.log('✅ [AUTH] Synced selected address to AddressContext');
      }

      // Check if user needs address setup
      const needsAddress = !response.selectedAddress;
      if (needsAddress) {
        setNeedsAddressSetup(true);
      }

      return {
        success: true,
        isNewUser: !response.isExist, // Use isExist from API to determine if this is a new user
        needsAddressSetup: needsAddress,
      };
    } catch (error: any) {
      console.error('❌ [AUTH] Login failed:', error);
      return {
        success: false,
        isNewUser: false,
        error: error.message || 'Login failed. Please try again.',
      };
    }
  };

  // DEPRECATED: Use editProfile instead for new users after Login
  // Kept for backward compatibility only
  const register = async (name: string, email: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    console.warn('⚠️ [AUTH] register() is deprecated. Use login() followed by editProfile() instead.');
    try {
      // Egypt country code - can be made dynamic later
      const countryCode = 20;
      const phoneNumber = phone.startsWith('0') ? phone.substring(1) : phone;

      console.log('📝 [AUTH] Registering new customer:', { name, email, phoneNumber, countryCode });

      const registerRequest: CustomerRegisterRequest = {
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        name: name,
        email: email,
        fcmToken: undefined, // TODO: Add FCM token from Firebase
        idToken: undefined,
      };

      const response = await customerRegister(registerRequest);

      console.log('✅ [AUTH] Registration successful:', response);

      // Store auth token
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);

      // Create user object from response
      const newUser: User = {
        id: response.customerId.toString(),
        name: response.displayName,
        email: email, // Keep the provided email
        phone: response.phoneNumber,
        walletBalance: response.wallet,
        points: response.points,
        isRegistered: true,
        selectedAddress: response.selectedAddress,
      };

      await saveUser(newUser);

      // Sync selected address to AddressContext storage
      if (response.selectedAddress) {
        await AsyncStorage.setItem('@mira_selected_address', JSON.stringify(response.selectedAddress));
        console.log('✅ [AUTH] Synced selected address to AddressContext');
      } else {
        // New user without address - set flag to enforce address creation
        console.log('⚠️ [AUTH] New user registered without address - will require address setup');
        setNeedsAddressSetup(true);
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ [AUTH] Registration failed:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      };
    }
  };

  const editProfileFunc = async (name?: string, email?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        console.error('❌ [AUTH] Cannot edit profile - no user logged in');
        return {
          success: false,
          error: 'You must be logged in to edit your profile.',
        };
      }

      console.log('✏️ [AUTH] Editing profile:', { name, email });

      const editProfileRequest: EditProfileRequest = {
        fcmToken: undefined, // TODO: Add FCM token from Firebase
        email: email,
        name: name,
      };

      const response = await editProfile(editProfileRequest);

      console.log('✅ [AUTH] Profile updated successfully:', response);

      // Update user object with new information
      // Note: API may return empty response, so we use provided values as fallback
      const updatedUser: User = {
        ...user,
        name: name || response.displayName || user.name,
        email: email || response.email || user.email,
        walletBalance: response.wallet || user.walletBalance,
        points: response.points || user.points,
      };

      await saveUser(updatedUser);

      return { success: true };
    } catch (error: any) {
      console.error('❌ [AUTH] Profile update failed:', error);
      return {
        success: false,
        error: error.message || 'Profile update failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(AUTH_STATUS_KEY);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem('@mira_selected_address'); // Clear AddressContext storage
      setUser(null);
      setNeedsAddressSetup(false);
      console.log('✅ [AUTH] Logged out and cleared all data');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const completeGuestFlow = async () => {
    try {
      await AsyncStorage.setItem(AUTH_STATUS_KEY, 'guest');
      const guestUser: User = {
        id: 'guest',
        name: 'Guest User',
        phone: '',
        isRegistered: false,
      };
      setUser(guestUser);
    } catch (error) {
      console.error('Error completing guest flow:', error);
    }
  };

  const updateSelectedAddress = async (address: Address) => {
    if (!user) return;

    try {
      const updatedUser: User = {
        ...user,
        selectedAddress: address,
      };
      await saveUser(updatedUser);

      // Sync to AddressContext storage
      await AsyncStorage.setItem('@mira_selected_address', JSON.stringify(address));
      console.log('✅ [AUTH] Updated and synced selected address');

      setNeedsAddressSetup(false); // Address setup is now complete
    } catch (error) {
      console.error('Error updating selected address:', error);
    }
  };

  const markAddressSetupComplete = () => {
    setNeedsAddressSetup(false);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        needsAddressSetup,
        login,
        register,
        editProfile: editProfileFunc,
        logout,
        checkPhoneNumber,
        completeGuestFlow,
        updateSelectedAddress,
        refreshUser,
        markAddressSetupComplete,
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

