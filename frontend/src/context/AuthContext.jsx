// /frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Corrected import
import { useNavigate } from "react-router-dom";
import API_URL from "../config"; // Import API URL from config.js

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
        const decoded = jwtDecode(token);
        // Check if token is expired:
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

  // Function to log in
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Login failed" };
      }
      // Save the token in localStorage
      localStorage.setItem("token", data.token);
      setAuth({ token: data.token, user: jwtDecode(data.token) });
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Server error during login." };
    }
  };

  // Function to register a new user
  const register = async (email, password, name) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Registration failed" };
      }
      localStorage.setItem("token", data.token);
      setAuth({ token: data.token, user: jwtDecode(data.token) });
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Server error during registration." };
    }
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null });
    navigate("/login");
  };

  // Automatically log out when the token expires
  useEffect(() => {
    if (auth.token) {
      const decoded = jwtDecode(auth.token);
      const expiresAt = decoded.exp * 1000;
      const timeout = expiresAt - Date.now();
      if (timeout <= 0) {
        logout();
      } else {
        const timer = setTimeout(logout, timeout);
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
