import { firebaseAuth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  deleteUser,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
  Auth,
} from 'firebase/auth';

/**
 * Firebase Authentication Service
 * Provides methods for user authentication using Firebase Auth
 */
class FirebaseAuthService {
  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return firebaseAuth.currentUser;
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      return userCredential;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      return userCredential;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with phone number
   * Note: Phone auth requires reCAPTCHA which is not available in React Native
   * Use your backend API for phone authentication instead
   */
  async signInWithPhoneNumber(phoneNumber: string): Promise<any> {
    throw new Error(
      'Phone authentication should be handled through your backend API with Firebase Admin SDK'
    );
  }

  /**
   * Confirm phone number verification code
   * Note: Use your backend API for phone authentication
   */
  async confirmPhoneVerification(
    confirmation: any,
    code: string
  ): Promise<UserCredential> {
    throw new Error(
      'Phone authentication should be handled through your backend API with Firebase Admin SDK'
    );
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(firebaseAuth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      await firebaseUpdateProfile(user, updates);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user email
   */
  async updateEmail(newEmail: string): Promise<void> {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      await firebaseUpdateEmail(user, newEmail);
    } catch (error: any) {
      console.error('Update email error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      await firebaseUpdatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Update password error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      await deleteUser(user);
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(
    callback: (user: User | null) => void
  ): () => void {
    return firebaseOnAuthStateChanged(firebaseAuth, callback);
  }

  /**
   * Get user ID token
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string> {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      return await user.getIdToken(forceRefresh);
    } catch (error: any) {
      console.error('Get ID token error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle Firebase Auth errors and return user-friendly messages
   */
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    let errorMessage = 'An error occurred during authentication';

    switch (errorCode) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No user found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Please sign in again to complete this action';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return new Error(errorMessage);
  }
}

export default new FirebaseAuthService();
