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

  if (isLoading) {
    return null; // Or a loading screen
  }

  if (!isAuthenticated) {
    return <AuthNavigator onComplete={completeGuestFlow} />;
  }

  // If registered user needs address setup, show AuthNavigator to complete the flow
  if (needsAddressSetup && user?.isRegistered) {
    console.log('⚠️ [APP] Registered user needs address setup - redirecting to address creation');
    return <AuthNavigator onComplete={completeGuestFlow} />;
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
