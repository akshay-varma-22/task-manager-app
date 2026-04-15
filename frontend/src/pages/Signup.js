import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    // basic validation
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://task-manager-app-zrrp.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      alert("User created successfully!");

      // ✅ redirect only after success
      navigate("/");

    } catch (err) {
      console.error("Signup error:", err);
      setError("Cannot connect to backend");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}

        {/* ✅ Navigation back to login */}
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;