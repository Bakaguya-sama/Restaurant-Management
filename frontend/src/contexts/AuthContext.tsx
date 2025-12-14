import React, { createContext, useContext, useState } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

    setUserProfile({
      name: role === "customer" ? customerProfile.name : "Nhân viên",
      email:
        role === "customer" ? customerProfile.email : "staff@restaurant.com",
      phone: role === "customer" ? customerProfile.phone : "0123456789",
      role,
      address: role === "customer" ? undefined : "123 Đường ABC, Hà Nội",
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...profile });
    }
  };

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
