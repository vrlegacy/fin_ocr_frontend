import { Sidebar } from "../components/sidebar";
import { useTheme } from "../context/ThemeContext";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";
import { useIsMobile } from "../components/ui/use-mobile";

export function SettingsPage() {
  const { theme } = useTheme();
  const { isCollapsed } = useSidebarCollapsed();
  const isMobile = useIsMobile();

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ background: theme === "dark" ? "#1C1C1C" : "#F5F5F5" }}
    >
      <Sidebar />

      <div
        className="flex-1 px-4 pb-6 md:p-8 pt-20 md:pt-8 min-w-0"
        style={{
          marginLeft: isMobile ? 0 : isCollapsed ? "5rem" : "16rem",
          transition: "margin-left 0.25s ease-in-out"
        }}
      >
        <div className="mb-6 md:mb-8">
          <h1
            className="tracking-tight transition-colors"
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: theme === "dark" ? "#F1F5F9" : "#1C1C1C",
              marginBottom: "8px",
            }}
          >
            Settings
          </h1>
          <p
            className="transition-colors"
            style={{
              fontSize: "14px",
              color: theme === "dark" ? "#7E7E7E" : "#7E7E7E",
            }}
          >
            Configure your application preferences.
          </p>
        </div>

        <div
          className="rounded-3xl p-6 md:p-8 border transition-all duration-300"
          style={{
            background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
            borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
            boxShadow:
              theme === "dark"
                ? "0 10px 30px rgba(0, 0, 0, 0.3)"
                : "0 10px 30px rgba(15, 23, 42, 0.03)",
          }}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Settings panel coming soon. Change the theme in the bottom-left profile dropdown menu.
          </p>
        </div>
      </div>
    </div>
  );
}