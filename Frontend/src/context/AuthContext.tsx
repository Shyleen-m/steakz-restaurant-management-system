import {
  createContext,
  useContext,
  useState
} from "react";

import type {
  User,
  UserRole
} from "../types";

interface AuthContextType {
  user: User | null;

  token: string | null;

  setAuth: (
    user: User,
    token: string
  ) => void;

  logout: () => void;

  hasRole: (
    role: UserRole | UserRole[]
  ) => boolean;

  isAuthenticated: boolean;
}

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

export const AuthProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] =
    useState<User | null>(() => {
      const storedUser =
        localStorage.getItem("user");
      return storedUser
        ? JSON.parse(storedUser)
        : null;
    });

  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem("token")
    );

  const setAuth = (
    userData: User,
    tokenData: string
  ) => {
    setUser(userData);

    setToken(tokenData);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "token",
      tokenData
    );
  };

  const logout = () => {
    setUser(null);

    setToken(null);

    localStorage.removeItem("user");

    localStorage.removeItem("token");
  };

  const hasRole = (
    role: UserRole | UserRole[]
  ): boolean => {
    if (!user) {
      return false;
    }

    if (Array.isArray(role)) {
      return role.includes(
        user.role
      );
    }

    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setAuth,
        logout,
        hasRole,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};
