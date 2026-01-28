"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("API Response:", JSON.stringify(data, null, 2));

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      // Store token and user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Is Admin Role:", data.user.role === "ADMIN");
      // Redirect based on role
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo or Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">
            성북구 중장년 기술창업센터
          </h1>
          <p className="text-gray-400">로그인</p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                비밀번호
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              계정이 없으신가요?{" "}
              <button
                onClick={() => router.push("/register")}
                className="font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                회원가입
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-400 transition-colors hover:text-gray-300"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
