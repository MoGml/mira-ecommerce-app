/**
 * Firebase App Integration Example
 *
 * This file shows how to integrate Firebase into your App.tsx
 * Copy the relevant parts into your main App.tsx file
 */

import React, { useEffect } from 'react';
import { initializeFirebase, logFCMToken } from '../utils/initializeFirebase';
import FirebaseAuthService from '../services/FirebaseAuthService';

export default function App() {
  useEffect(() => {
    // Initialize Firebase on app mount
    const setupFirebase = async () => {
      try {
        await initializeFirebase();

        // Log FCM token for testing (remove in production)
        if (__DEV__) {
          await logFCMToken();
        }
      } catch (error) {
        console.error('Firebase setup failed:', error);
      }
    };

    setupFirebase();

    // Optional: Subscribe to auth state changes globally
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        // TODO: Update global auth state, navigate to home screen, etc.
      } else {
        console.log('User signed out');
        // TODO: Navigate to login screen
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    // Your existing app code here
    <></>
  );
}

/**
 * Example: Using Firebase Auth in a Login Screen
 */
export const LoginScreenExample = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const userCredential = await FirebaseAuthService.signInWithEmail(email, password);
      console.log('Login successful:', userCredential.user.uid);

      // Navigate to home screen
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError('');

      const userCredential = await FirebaseAuthService.signUpWithEmail(email, password);
      console.log('Sign up successful:', userCredential.user.uid);

      // Navigate to home screen
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your login UI here
    <></>
  );
};

/**
 * Example: Using the useFirebaseAuth hook
 */
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export const LoginScreenWithHook = () => {
  const { user, loading, error, signIn, signUp, isAuthenticated } = useFirebaseAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // Navigation will be handled by the auth state listener
    } catch (err: any) {
      console.error('Login failed:', err.message);
    }
  };

  if (isAuthenticated) {
    // User is logged in
    return <></>;
  }

  return (
    // Your login UI here
    <></>
  );
};
