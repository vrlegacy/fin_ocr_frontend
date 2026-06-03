import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Accent - Emerald blur */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none">
        <div
          className="h-72 w-72 rounded-full blur-[120px]"
          style={{
            background: "rgba(16,185,129,0.15)",
            position: "absolute",
            top: "-120px",
            left: "-120px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center font-bold text-2xl border border-slate-200/50 shadow-sm"
            style={{
              background: "white",
              color: "#065F46",
            }}
          >
            N
          </div>

          <h1
            className="font-bold"
            style={{
              fontSize: "32px",
              color: "#12133A",
            }}
          >
            Neuberg
          </h1>

          <p className="text-gray-500 mt-2">
            Smart Report Processing
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-white rounded-3xl p-8"
          style={{
            boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
            border: "1px solid rgba(226, 232, 240, 0.8)"
          }}
        >
          <h2
            className="font-bold mb-2"
            style={{
              fontSize: "28px",
              color: "#12133A",
            }}
          >
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-8">
            Sign in to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#065F46] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2 font-medium">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#065F46] transition-colors"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm font-semibold hover:underline cursor-pointer"
                style={{
                  color: "#065F46",
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition hover:opacity-95 cursor-pointer shadow-sm"
              style={{
                background: "#065F46",
              }}
            >
              Sign In
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {/* Google Sign-in Option */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors cursor-pointer text-sm font-semibold shadow-2xs"
            style={{ color: "#12133A" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.26620003,9.76453951 C6.19878753,6.93863203 8.85468502,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.21818182,0 3.10909091,2.72727273 1.09090909,6.72727273 L5.26620003,9.76453951 Z"
              />
              <path
                fill="#4285F4"
                d="M23.6363636,12.2727273 C23.6363636,11.4545455 23.5636364,10.6909091 23.4181818,9.95454545 L12,9.95454545 L12,14.5090909 L18.5272727,14.5090909 C18.2454545,16 17.3909091,17.2727273 16.1272727,18.1090909 L19.9636364,21.0909091 C22.2181818,19 23.6363636,15.9272727 23.6363636,12.2727273 Z"
              />
              <path
                fill="#FBBC05"
                d="M1.09090909,17.2727273 C3.10909091,21.2727273 7.21818182,24 12,24 C15.0545455,24 17.7818182,22.8545455 19.9636364,21.0909091 L16.1272727,18.1090909 C15.0545455,18.8272727 13.6909091,19.2727273 12,19.2727273 C8.85468502,19.2727273 6.19878753,17.2431862 5.26620003,14.4172787 L1.09090909,17.2727273 Z"
              />
              <path
                fill="#34A853"
                d="M1.09090909,6.72727273 L5.26620003,9.76453951 C6.19878753,9.76453951 6.19878753,9.76453951 6.19878753,9.76453951 C6.19878753,11.0909091 5.92727273,12.3818182 5.26620003,13.5636364 L1.09090909,16.6363636 C0.4,15.2727273 0,13.7272727 0,12 C0,10.1363636 0.436363636,8.38181818 1.09090909,6.72727273 Z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="text-center mt-8 text-gray-500 text-sm font-medium">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-semibold hover:underline cursor-pointer"
              style={{
                color: "#065F46",
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}