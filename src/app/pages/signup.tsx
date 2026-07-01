import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function SignupPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { signup } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.debug("Signup request payload:", { username, email, password });
      await signup(username, email, password);
      toast.success("Account created and logged in successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Signup failed:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#090A0F] text-foreground flex items-center justify-center px-6 py-4 relative overflow-y-auto transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="h-96 w-96 rounded-full blur-[140px] opacity-40 dark:opacity-20"
          style={{
            background: "radial-gradient(circle, #10B981 0%, transparent 70%)",
            position: "absolute",
            top: "-150px",
            left: "-100px",
          }}
        />
        <div
          className="h-96 w-96 rounded-full blur-[140px] opacity-30 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)",
            position: "absolute",
            bottom: "-150px",
            right: "-100px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 py-1">
        {/* Logo */}
        <div className="text-center mb-6 flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#059669] shadow-lg border border-emerald-400/20"
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v4c0 .5-.2 1-.6 1.4-.4.4-.9.6-1.4.6H6" />
              <path d="M18 14H6" />
            </svg>
          </div>

          <div>
            <h1
              className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100"
              style={{ letterSpacing: "-0.8px" }}
            >
              Finch
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">
              AI-Powered Personal Wealth & Expense Engine
            </p>
          </div>
        </div>

        {/* Signup Card */}
        <div
          className="glass-panel rounded-3xl p-6 md:p-8 border"
          style={{
            borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
          }}
        >
          <h2
            className="text-lg font-bold mb-1 text-slate-800 dark:text-slate-100"
          >
            Create Account
          </h2>

          <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">
            Join 1,000+ users tracking expenses effortlessly with Finch AI.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                className="w-full h-11 px-3.5 rounded-xl border outline-none text-sm font-semibold transition-all duration-150 glass-input focus:border-[#10B981]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="w-full h-11 px-3.5 rounded-xl border outline-none text-sm font-semibold transition-all duration-150 glass-input focus:border-[#10B981]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border outline-none text-sm font-semibold transition-all duration-150 glass-input focus:border-[#10B981]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 text-xs rounded-xl border text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#10B981] hover:bg-[#059669] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 duration-100 border-0 mt-2"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          </div>

          <div className="text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-bold text-[#10B981] hover:underline cursor-pointer bg-transparent border-0 p-0"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

