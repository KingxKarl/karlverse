import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password); // Capture the login result
    if (result.success) {
      // On success, redirect the user to the dashboard/homepage ("/")
      navigate("/");
    } else {
      // Optionally, you can handle login errors here (e.g., display an error message)
      console.error("Login failed:", result.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-card p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-center text-2xl font-bold text-primary">Welcome Back</h2>
        <p className="text-center text-gray-600 mb-4">Log in to continue</p>

        <button className="w-full bg-blue-500 text-white py-2 rounded-md mb-4">
          Continue with Google
        </button>

        <div className="border-b my-4"></div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-4"
          />
          <button className="w-full bg-primary text-white py-2 rounded-md">Login</button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          New here? <a href="/register" className="text-primary">Create an account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
