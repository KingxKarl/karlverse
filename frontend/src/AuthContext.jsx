import React, { createContext, useState, useEffect } from "react";

// Create a context for authentication
export const AuthContext = createContext();

// AuthProvider component to wrap the app and provide auth state and functions
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("authToken") || null,
    user: JSON.parse(localStorage.getItem("authUser")) || null
  });

  // Persist auth state to localStorage
  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("authToken", auth.token);
    } else {
      localStorage.removeItem("authToken");
    }
    if (auth.user) {
      localStorage.setItem("authUser", JSON.stringify(auth.user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [auth]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await fetch("https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setAuth({ token: data.token, user: data.user });
        return { success: true };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Server error" };
    }
  };

  // Registration function
  const register = async (name, email, password) => {
    try {
      const res = await fetch("https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setAuth({ token: data.token, user: data.user });
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Server error" };
    }
  };

  const logout = () => {
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
