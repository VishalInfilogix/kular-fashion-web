"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "@/config";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("authToken");
    if (token) {
      router.replace("/");
    }
  }, [mounted]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Please enter email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!password.trim()) {
      newErrors.password = "Please enter password.";
    }

    return newErrors;
  };

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const { data } = await axios.post(`${apiBaseUrl}login`, {
        email,
        password,
      });

      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("userDetails", JSON.stringify(data.data));

      toast.success("Login successful!");
      setEmail("");
      setPassword("");
      setSubmitted(false);
      setErrors({});

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Login failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-[70vh] flex items-center justify-center bg-gray-100">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-7 my-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Login</h1>

        <form onSubmit={handleLogin} className="space-y-2">
          <div>
            <label className="block text-md font-medium text-gray-700 mb-0.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (submitted) {
                  const errs = validate();
                  setErrors(errs);
                }
              }}
              className="w-full px-5 py-3 border border-gray-300 rounded-md  shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter your email"
            />
            {submitted && errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-0.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (submitted) {
                  const errs = validate();
                  setErrors(errs);
                }
              }}
              className="w-full px-5 py-3 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter your password"
            />
            {submitted && errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}

            <div className="text-right mt-1">
              <a
                href="/forgot-password"
                className="text-sm text-[var(--primary)] hover:underline font-medium"
              >
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold text-lg rounded-xl cursor-pointer border border-transparent transition-all duration-300 ease-in-out ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[var(--primary)] text-white hover:bg-white hover:text-[var(--primary)] hover:border-[var(--primary)]"
            }`}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="mt-3 text-center text-base text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/create-account"
            className="text-[var(--primary)] hover:underline rounded-md font-medium"
          >
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
