import React, { createContext, useContext, useState } from "react";
import { UserRole } from "../types";

interface UserProfile {
  id?: string; // Added staff/customer ID
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
  // Load from localStorage on initial mount
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem("isAuthenticated");
    console.log("AuthContext init - isAuthenticated from localStorage:", saved);
    return saved === "true";
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("userProfile");
    console.log("AuthContext init - userProfile from localStorage:", saved);
    return saved ? JSON.parse(saved) : null;
  });

  const login = (role: UserRole) => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");

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

    const profile = {
      id: role === "customer" ? "CUSTOMER_ID_MOCK" : "6759e8f123456789abcdef12", // Mock staff ID (24 chars for MongoDB ObjectId)
      name: role === "customer" ? customerProfile.name : "Nhân viên",
      email:
        role === "customer" ? customerProfile.email : "staff@restaurant.com",
      phone: role === "customer" ? customerProfile.phone : "0123456789",
      role,
      address: role === "customer" ? undefined : "123 Đường ABC, Hà Nội",
    };
    
    setUserProfile(profile);
    localStorage.setItem("userProfile", JSON.stringify(profile));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userProfile");
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (userProfile) {
      const updated = { ...userProfile, ...profile };
      setUserProfile(updated);
      localStorage.setItem("userProfile", JSON.stringify(updated));
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
