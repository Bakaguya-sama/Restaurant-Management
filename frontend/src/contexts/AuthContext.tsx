import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "../types";
import { authService } from "../lib/authService";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: UserRole;
  membership_level?: string;
  points?: number;
  total_spent?: number;
  isBanned?: boolean;
  image_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: (identifier: string, password: string, role?: UserRole) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "restaurant_auth";
const USER_PROFILE_STORAGE_KEY = "restaurant_user_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = authService.getAccessToken();
        const savedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);

        if (accessToken && savedProfile) {
          try {
            const response = await authService.getCurrentUser();
            const user = response.data;
            
            const profile: UserProfile = {
              id: user.id,
              name: user.full_name,
              email: user.email,
              phone: user.phone,
              address: user.address,
              role: user.role,
              membership_level: user.membership_level,
              points: user.points,
              total_spent: user.total_spent,
              isBanned: user.isBanned,
              image_url: user.image_url
            };

            setUserProfile(profile);
            setIsAuthenticated(true);
            localStorage.setItem(AUTH_STORAGE_KEY, "true");
            localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
          } catch (error) {
            authService.clearTokens();
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Error restoring auth state:", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string, role?: UserRole) => {
    try {
      const response = await authService.login({ identifier, password, role });
      const { accessToken, refreshToken, user } = response.data;

      authService.setTokens(accessToken, refreshToken);

      const profile: UserProfile = {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        membership_level: user.membership_level,
        points: user.points,
        total_spent: user.total_spent,
        isBanned: user.isBanned,
        image_url: user.image_url
      };

      setUserProfile(profile);
      setIsAuthenticated(true);

      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
      
      return profile;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setIsAuthenticated(false);
      setUserProfile(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...profile };
      setUserProfile(updatedProfile);

      localStorage.setItem(
        USER_PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#625EE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userProfile,
        login,
        logout,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
