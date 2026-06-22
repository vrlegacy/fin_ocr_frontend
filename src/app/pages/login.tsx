import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const {
    isAuthenticated,
    loginWithEmailPassword,
    loginWithGoogle,
    resetPassword
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = () => {
    setError(null);
    setNewPassword("");
    setConfirmPassword("");
    setMode("forgot");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await loginWithEmailPassword(email, password);
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;

    if (!uppercaseRegex.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!numberRegex.test(newPassword)) {
      setError("Password must contain at least one number");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await resetPassword(email, newPassword);
      toast.success("Password reset and logged in successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
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

        {/* Login Card */}
        <div
          className="glass-panel rounded-3xl p-6 md:p-8 border"
          style={{
            borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
          }}
        >
          <h2
            className="text-lg font-bold mb-1 text-slate-800 dark:text-slate-100"
          >
            {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h2>

          <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">
            {mode === 'login' ? 'Sign in to access your wealth command center.' : 'Enter details to reset and sign in'}
          </p>

          {mode === 'login' ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="Enter your password"
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

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <div className="p-3.5 text-xs rounded-xl border text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#10B981] hover:bg-[#059669] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 duration-100 border-0"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
              </form>

              {/* Social Divider */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              </div>

              {/* Google Sign-in Option */}
              <button
                type="button"
                onClick={() => {
                  console.log("GOOGLE BUTTON CLICKED");
                  loginWithGoogle();
                }}
                className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider shadow-sm glass-button"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                Google Account
              </button>

              <div className="text-center mt-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                New to Finch?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-bold text-[#10B981] hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Create Account
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
                  New Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full h-11 pl-3.5 pr-10 rounded-xl border outline-none text-sm font-semibold transition-all duration-150 glass-input focus:border-[#10B981]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Confirm New Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full h-11 pl-3.5 pr-10 rounded-xl border outline-none text-sm font-semibold transition-all duration-150 glass-input focus:border-[#10B981]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#10B981] hover:bg-[#059669] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-md border-0"
              >
                {isSubmitting ? "Resetting & Signing In..." : "Reset & Sign In"}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}