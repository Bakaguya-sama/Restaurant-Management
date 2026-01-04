import { useState, useCallback } from 'react';
import { authService, ForgotPasswordData, ResetPasswordData } from '../lib/authService';

interface PasswordResetState {
  loading: boolean;
  error: string | null;
  success: boolean;
  email: string | null;
}

export function usePasswordReset() {
  const [state, setState] = useState<PasswordResetState>({
    loading: false,
    error: null,
    success: false,
    email: null,
  });

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    try {
      setState({ loading: true, error: null, success: false, email: null });
      const response = await authService.forgotPassword(data);
      
      if (response.success) {
        setState({
          loading: false,
          error: null,
          success: true,
          email: response.data?.email || data.email,
        });
      } else {
        setState({
          loading: false,
          error: response.message || 'Failed to send reset code',
          success: false,
          email: null,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset code';
      setState({
        loading: false,
        error: errorMessage,
        success: false,
        email: null,
      });
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await authService.resetPassword(data);
      
      if (response.success) {
        setState({
          loading: false,
          error: null,
          success: true,
          email: response.data?.email || null,
        });
        return true;
      } else {
        setState({
          loading: false,
          error: response.message || 'Failed to reset password',
          success: false,
          email: null,
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setState({
        loading: false,
        error: errorMessage,
        success: false,
        email: null,
      });
      return false;
    }
  }, []);

  const clearState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      email: null,
    });
  }, []);

  return {
    ...state,
    forgotPassword,
    resetPassword,
    clearState,
  };
}
