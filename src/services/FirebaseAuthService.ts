import { firebaseAuth, FirebaseAuthTypes } from '../config/firebase';

/**
 * Firebase Authentication Service
 * Provides methods for user authentication using Firebase Auth
 */
class FirebaseAuthService {
  /**
   * Get current authenticated user
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return firebaseAuth.currentUser;
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
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
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(
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
   */
  async signInWithPhoneNumber(
    phoneNumber: string
  ): Promise<FirebaseAuthTypes.ConfirmationResult> {
    try {
      const confirmation = await firebaseAuth.signInWithPhoneNumber(phoneNumber);
      return confirmation;
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirm phone number verification code
   */
  async confirmPhoneVerification(
    confirmation: FirebaseAuthTypes.ConfirmationResult,
    code: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await confirmation.confirm(code);
      return userCredential;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseAuth.signOut();
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
      await firebaseAuth.sendPasswordResetEmail(email);
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
      await user.updateProfile(updates);
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
      await user.updateEmail(newEmail);
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
      await user.updatePassword(newPassword);
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
      await user.delete();
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void
  ): () => void {
    return firebaseAuth.onAuthStateChanged(callback);
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
