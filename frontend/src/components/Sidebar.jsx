import { useState } from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Header with Hamburger Menu & "HiredSoon" Title */}
      <div className="fixed top-0 left-0 w-full flex items-center bg-backgroundLight dark:bg-backgroundDark p-4 shadow-md z-50">
        {/* Hamburger Button */}
        <button
          className="mr-4 p-2 bg-gray-800 text-white rounded-md shadow-lg dark:bg-gray-300 dark:text-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {/* "HiredSoon" Title - Acts as a Link to Dashboard */}
        <Link
          to="/"
          className="text-2xl font-bold text-primary dark:text-highlight hover:opacity-80"
          onClick={() => setIsOpen(false)}
        >
          HiredSoon
        </Link>
      </div>

      {/* Sidebar Menu */}
      <div
        className={`fixed top-4 left-4 h-full w-64 bg-backgroundLight dark:bg-backgroundDark shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-6 relative">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-gray-600 dark:text-white"
            onClick={() => setIsOpen(false)}
          >
            ✖
          </button>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-4">
            <Link
              to="/"
              className="block text-gray-700 dark:text-white hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/jobs"
              className="block text-gray-700 dark:text-white hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Job List
            </Link>
            <Link
              to="/add-job"
              className="block text-gray-700 dark:text-white hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Add Job
            </Link>
          </nav>

          {/* Dark Mode Toggle */}
          <div className="mt-4">
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Sidebar;
