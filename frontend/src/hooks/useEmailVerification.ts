import { useState, useCallback } from 'react';
import { authService } from '../lib/authService';

interface EmailVerificationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  remainingCooldown?: number; // Remaining seconds before next resend is allowed
}

export function useEmailVerification() {
  const [state, setState] = useState<EmailVerificationState>({
    loading: false,
    error: null,
    success: false,
    remainingCooldown: undefined,
  });

  const extractCooldownSeconds = (errorMessage: string): number | undefined => {
    const match = errorMessage.match(/chờ (\d+) giây/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return undefined;
  };

  const verifyEmail = useCallback(async (token: string) => {
    try {
      setState({ loading: true, error: null, success: false, remainingCooldown: undefined });
      const response = await authService.verifyEmail(token);
      
      if (response.success) {
        setState({
          loading: false,
          error: null,
          success: true,
          remainingCooldown: undefined,
        });
      } else {
        setState({
          loading: false,
          error: response.message || 'Email verification failed',
          success: false,
          remainingCooldown: undefined,
        });
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed';
      setState({
        loading: false,
        error: errorMessage,
        success: false,
        remainingCooldown: undefined,
      });
      throw new Error(errorMessage);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      setState({ loading: true, error: null, success: false, remainingCooldown: undefined });
      const response = await authService.resendVerificationEmail(email);
      
      if (response.success) {
        setState({
          loading: false,
          error: null,
          success: true,
          remainingCooldown: undefined,
        });
        return response;
      } else {
        const errorMsg = response.message || 'Failed to send verification email';
        const cooldownSeconds = extractCooldownSeconds(errorMsg);
        setState({
          loading: false,
          error: errorMsg,
          success: false,
          remainingCooldown: cooldownSeconds,
        });
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification email';
      const cooldownSeconds = extractCooldownSeconds(errorMessage);
      setState({
        loading: false,
        error: errorMessage,
        success: false,
        remainingCooldown: cooldownSeconds,
      });
      throw new Error(errorMessage);
    }
  }, []);

  return {
    verifyEmail,
    resendVerificationEmail,
    ...state,
  };
}
