import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "../types";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: (role: UserRole) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage keys
const AUTH_STORAGE_KEY = "restaurant_auth";
const USER_PROFILE_STORAGE_KEY = "restaurant_user_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authentication state from localStorage on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const savedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);

      if (savedAuth === "true" && savedProfile) {
        setIsAuthenticated(true);
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error("Error restoring auth state:", error);
      // Clear invalid data
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (role: UserRole) => {
    setIsAuthenticated(true);

    // Mock user profile based on role
    // TEST BLACKLIST: Switch between customers to test different scenarios

    // Option 1: Normal customer (NOT blacklisted) - C001
    const customerProfile = {
      name: "Nguyễn Văn An",
      email: "an.nguyen@email.com",
      phone: "0912345678",
    };

    // Option 2: Blacklisted customer - C002
    // const customerProfile = {
    //   name: "Trần Thị Bình",
    //   email: "binh.tran@email.com",
    //   phone: "0987654321",
    // };

    const profile: UserProfile = {
      name: role === "customer" ? customerProfile.name : "Nhân viên",
      email:
        role === "customer" ? customerProfile.email : "staff@restaurant.com",
      phone: role === "customer" ? customerProfile.phone : "0123456789",
      role,
      address: role === "customer" ? undefined : "123 Đường ABC, Hà Nội",
    };

    setUserProfile(profile);

    // Persist to localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);

    // Clear localStorage
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...profile };
      setUserProfile(updatedProfile);

      // Update localStorage
      localStorage.setItem(
        USER_PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
    }
  };

  // Show loading state while restoring auth
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
