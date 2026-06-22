import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/navbar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export function SettingsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex min-h-screen transition-colors duration-300 flex-col bg-transparent">
      <Navbar />

      <div className="flex-1 px-4 pb-6 md:p-8 pt-24 md:pt-28 min-w-0 max-w-7xl mx-auto w-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-1.5">
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure your application preferences.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-8 border">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Settings panel coming soon. Change the theme in the top-right navbar menu.
          </p>
        </div>
      </div>
    </div>
  );
}