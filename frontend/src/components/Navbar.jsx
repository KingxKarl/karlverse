import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, LogIn, LogOut, User } from "lucide-react"; // Icons

const NavBar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${searchQuery}`);
  };

  return (
    <nav className="bg-[#1A202C] text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Left: Logo */}
      <Link to="/" className="text-2xl font-bold text-[#4FD1C5]">
        HiredSoon
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center bg-white rounded-md px-3 py-1">
        <input
          type="text"
          placeholder="Search jobs by title or company..."
          className="p-2 text-black outline-none w-80"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="px-3 py-1 bg-[#4FD1C5] text-white rounded-md">
          Search
        </button>
      </form>

      {/* Right: Links & Icons */}
      <div className="flex items-center gap-6">
        <Link to="/" className="hover:text-[#4FD1C5]">Home</Link>
        {auth.token ? (
          <>
            <Link to="/profile">
              <User className="w-5 h-5 hover:text-[#4FD1C5]" />
            </Link>
            <button onClick={logout} className="flex items-center gap-1 hover:text-[#4FD1C5]">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-1 hover:text-[#4FD1C5]">
            <LogIn className="w-5 h-5" />
            Login
          </Link>
        )}
        {/* Notification Bell (for follow-up reminders) */}
        <button className="relative">
          <Bell className="w-5 h-5 hover:text-[#4FD1C5]" />
          {/* Placeholder for future notification count */}
          {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">1</span> */}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
