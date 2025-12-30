import { LoginUserDTO } from "../types/auth";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState<LoginUserDTO>({
    usernameOrEmail: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5052/api/user/loginUser",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      if (data.token) {
        login(data.token);
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="usernameOrEmail"
          type="text"
          placeholder="Username or Email"
          value={form.usernameOrEmail}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-sm">
        Don’t have an account?{" "}
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={onSwitchToRegister}
        >
          Register
        </button>
      </p>
    </div>
  );
};
