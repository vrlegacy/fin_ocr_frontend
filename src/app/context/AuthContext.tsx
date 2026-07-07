import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { apiUrl } from "../lib/api";

export interface AuthUser {
  id?: number;
  auth0_user_id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  picture?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => void;
  token: string | null;
  updateProfile: (username: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatErrorMessage = (data: any, fallback: string): string => {
  if (!data) return fallback;
  if (typeof data.detail === "string") {
    return data.detail;
  }
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err: any) => {
        const fieldName = err.loc && err.loc.length > 1 ? err.loc[1] : "";
        return fieldName ? `${fieldName}: ${err.msg}` : err.msg;
      })
      .join(", ");
  }
  if (data.description) {
    return data.description;
  }
  if (data.message) {
    return data.message;
  }
  if (data.detail && typeof data.detail === "object") {
    return JSON.stringify(data.detail);
  }
  return fallback;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth0 = useAuth0();

  const [localToken, setLocalTokenState] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });
  const [localUser, setLocalUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [localLoading, setLocalLoading] = useState(true);

  const setLocalAuth = (token: string | null, user: AuthUser | null) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    setLocalTokenState(token);
    setLocalUser(user);
  };

  useEffect(() => {
    const getAuth0Token = async () => {
      if (auth0.isAuthenticated && auth0.user) {
        try {
          const token = await auth0.getAccessTokenSilently();
          
          // Verify with local backend if user is registered
          const response = await fetch(`${apiUrl}/api/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const dbUser = await response.json();
            setLocalAuth(token, dbUser);
            // Immediately redirect to dashboard on successful Google Login
            window.location.href = "/dashboard";
          } else {
            // Not registered or other backend issue - force logout from Auth0
            toast.error("You are not registered in the system. Please register first.");
            setLocalAuth(null, null);
            auth0.logout({
              logoutParams: {
                returnTo: window.location.origin,
              },
            });
          }
        } catch (error) {
          console.error("Error getting Auth0 token:", error);
        }
      }
    };
    getAuth0Token();
  }, [auth0.isAuthenticated, auth0.user]);

  useEffect(() => {
    const verifyToken = async () => {
      if (!localToken) {
        setLocalLoading(false);
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/api/me`, {
          headers: {
            Authorization: `Bearer ${localToken}`,
          },
        });
        if (response.ok) {
          const user = await response.json();
          setLocalAuth(localToken, user);
        } else {
          // Clear invalid local auth
          setLocalAuth(null, null);
        }
      } catch (error) {
        console.error("Error verifying local token:", error);
        // Do not automatically log out on connection issues, but stop loading
      } finally {
        setLocalLoading(false);
      }
    };

    verifyToken();
  }, [localToken]);

  const loginWithEmailPassword = async (email: string, password: string) => {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(formatErrorMessage(data, "Invalid email or password"));
    }

    setLocalAuth(data.access_token, data.user);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginWithEmailPassword(email, password);
      toast.success("Logged in successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
      return false;
    }
  };

  const loginWithGoogle = () => {
    auth0.loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
      },
    });
  };

  const forgotPassword = async (email: string) => {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

    const response = await fetch(
      `https://${domain}/dbconnections/change_password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          email,
          connection: "Username-Password-Authentication",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send password reset email");
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    const response = await fetch(`${apiUrl}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, new_password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(formatErrorMessage(data, "Failed to reset password"));
    }

    setLocalAuth(data.access_token, data.user);
  };


  const logout = () => {
    setLocalAuth(null, null);
    if (auth0.isAuthenticated) {
      auth0.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    } else {
      window.location.href = "/";
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(formatErrorMessage(data, "Failed to create account"));
    }

    setLocalAuth(data.access_token, data.user);
  };

  const updateProfile = async (username: string) => {
    if (!localToken) return;
    const response = await fetch(`${apiUrl}/api/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localToken}`,
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(formatErrorMessage(data, "Failed to update profile"));
    }

    const updatedUser = await response.json();
    setLocalAuth(localToken, updatedUser);
  };

  const isAuthenticated = auth0.isAuthenticated || (!!localToken && !!localUser && !localLoading);
  const isLoading = auth0.isLoading || (!!localToken && localLoading);

  // Transform Auth0 user profile into normalized AuthUser if authenticated via Auth0
  const normalizedUser: AuthUser | null = localUser
    ? {
        ...localUser,
        name: localUser.name || localUser.username || localUser.email.split("@")[0],
        picture: auth0.isAuthenticated && auth0.user ? auth0.user.picture : localUser.picture || null,
      }
    : auth0.isAuthenticated && auth0.user
      ? {
          auth0_user_id: auth0.user.sub || "",
          email: auth0.user.email || "",
          name: auth0.user.name || null,
          picture: auth0.user.picture || null,
        }
      : null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user: normalizedUser,
        loginWithEmailPassword,
        login,
        loginWithGoogle,
        forgotPassword,
        resetPassword,
        logout,
        token: localToken,
        updateProfile,
        signup,
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
