import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle form submission for logging in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(
        "https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Ensure cookies are sent/received
          body: JSON.stringify({ email, password })
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }
      // On successful login, redirect to the Dashboard (or another protected route)
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundLight dark:bg-backgroundDark">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-primary dark:text-highlight">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white p-2 rounded-md hover:bg-primaryHover transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
