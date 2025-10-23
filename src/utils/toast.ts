import { Alert } from 'react-native';

export interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const showToast = (options: ToastOptions) => {
  const { title, message, type = 'info' } = options;
  
  // For now, we'll use Alert as a simple toast implementation
  // In a real app, you might want to use a proper toast library like react-native-toast-message
  
  const alertTitle = title || getDefaultTitle(type);
  
  Alert.alert(alertTitle, message, [
    { text: 'OK', style: type === 'error' ? 'destructive' : 'default' }
  ]);
};

const getDefaultTitle = (type: string): string => {
  switch (type) {
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
    default:
      return 'Info';
  }
};

// Convenience functions
export const showSuccessToast = (message: string, title?: string) => {
  showToast({ title, message, type: 'success' });
};

export const showErrorToast = (message: string, title?: string) => {
  showToast({ title, message, type: 'error' });
};

export const showWarningToast = (message: string, title?: string) => {
  showToast({ title, message, type: 'warning' });
};

export const showInfoToast = (message: string, title?: string) => {
  showToast({ title, message, type: 'info' });
};
