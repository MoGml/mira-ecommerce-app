import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AddressProvider, useAddress } from './src/context/AddressContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { initializeFirebase } from './src/utils/initializeFirebase';

function AppContent() {
  const { isAuthenticated, isLoading, completeGuestFlow, needsAddressSetup, user } = useAuth();

  // Wrapper to handle auth flow completion
  // This should NOT call completeGuestFlow for registered users
  const handleAuthComplete = async () => {
    console.log('[APP] Auth flow completed');
    // Don't do anything - the user state is already set by login/register
    // completeGuestFlow is only called when user explicitly chooses guest mode
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  if (!isAuthenticated) {
    return <AuthNavigator onComplete={handleAuthComplete} />;
  }

  // If registered user needs address setup, show AuthNavigator to complete the flow
  if (needsAddressSetup && user?.isRegistered) {
    console.log('⚠️ [APP] Registered user needs address setup - redirecting to address creation');
    return <AuthNavigator onComplete={handleAuthComplete} />;
  }

  return <AppNavigator />;
}

export default function App() {
  useEffect(() => {
    // Initialize Firebase services (Auth & Cloud Messaging for push notifications)
    const setupFirebase = async () => {
      try {
        await initializeFirebase();
        console.log('✅ Firebase initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
      }
    };

    setupFirebase();
  }, []);

  return (
    <AuthProvider>
      <AddressProvider>
        <CartProvider>
          <AppContent />
          <StatusBar style="light" />
        </CartProvider>
      </AddressProvider>
    </AuthProvider>
  );
}
