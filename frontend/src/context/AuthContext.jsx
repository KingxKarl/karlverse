// /frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode"; // To decode the JWT on the client
import { useNavigate } from "react-router-dom";

// Create the AuthContext
const AuthContext = createContext();

// The AuthProvider component wraps your application and provides auth state and actions
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Initialize auth state from localStorage (if a token exists)
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode token to get user information and verify expiration.
        const decoded = jwt_decode(token);
        // (Optionally) check if token is expired:
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          return { token: null, user: null };
        }
        return { token, user: decoded };
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        return { token: null, user: null };
      }
    }
    return { token: null, user: null };
  });

  // Function to log in: sends email/password to backend,
  // saves the token to localStorage and updates state.
  const login = async (email, password) => {
    try {
      const response = await fetch(
        "https://your-backend-url/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Login failed" };
      }
      // Save the token in localStorage
      localStorage.setItem("token", data.token);
      setAuth({ token: data.token, user: data.user });
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Server error during login." };
    }
  };

  // Function to register a new user. (For brevity, similar to login.)
  const register = async (email, password, name) => {
    try {
      const response = await fetch(
        "https://your-backend-url/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Registration failed" };
      }
      localStorage.setItem("token", data.token);
      setAuth({ token: data.token, user: data.user });
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Server error during registration." };
    }
  };

  // Function to log out: removes the token and resets auth state.
  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null });
    navigate("/login");
  };

  // Optionally, set up an effect to auto‑log out when the token expires.
  useEffect(() => {
    if (auth.token) {
      const decoded = jwt_decode(auth.token);
      const expiresAt = decoded.exp * 1000;
      const timeout = expiresAt - Date.now();
      // If token is already expired, log out immediately.
      if (timeout <= 0) {
        logout();
      } else {
        const timer = setTimeout(() => {
          logout();
        }, timeout);
        // Cleanup on unmount or if token changes.
        return () => clearTimeout(timer);
      }
    }
  }, [auth.token]);

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing the auth context
export function useAuth() {
  return useContext(AuthContext);
}
