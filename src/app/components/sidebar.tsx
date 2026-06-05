import { useState } from "react";
import {
  Upload,
  History,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { AppLogo } from "./logo";
import { useTheme } from "../context/ThemeContext";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";
import { useIsMobile } from "./ui/use-mobile";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebarCollapsed();
  const isMobile = useIsMobile();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: Upload },
    { label: "OCR Entry", path: "/ocr-entry", icon: FileText },
    { label: "History", path: "/history", icon: History },
  ];

  const sidebarWidth = isMobile ? "16rem" : isCollapsed ? "5rem" : "16rem";

  return (
    <>
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 shadow-sm transition-colors duration-300"
          style={{
            background: theme === "dark" ? "#1C1C1C" : "#008060",
            borderBottom: theme === "dark" ? "1px solid #2A2A2A" : "1px solid #00664d",
            color: "white"
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <AppLogo />
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      )}

      {isMobile && mobileOpen && (
        <button
          className="fixed inset-0 z-45 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <div
        className={`flex-shrink-0 flex flex-col fixed left-0 top-0 z-50 ${className}`}
        onClick={() => {
          if (!isMobile && isCollapsed) {
            setIsCollapsed(false);
          }
        }}
        style={{
          background: theme === "dark" ? "#1C1C1C" : "#008060",
          height: "100vh",
          width: sidebarWidth,
          transform: isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
          transition: "width 0.25s ease-in-out, transform 0.25s ease-in-out, background-color 0.3s ease-in-out",
          boxShadow: isMobile && mobileOpen ? "10px 0 30px rgba(0, 0, 0, 0.25)" : "none",
          cursor: !isMobile && isCollapsed ? "pointer" : "default",
        }}
      >
      {/* Top Left: Logo */}
      <div className={`py-6 flex items-center ${!isMobile && isCollapsed ? "px-3 justify-center" : "px-6 justify-between"}`}>
        {(isMobile || !isCollapsed) && <AppLogo />}
        <button
          onClick={() => {
            if (isMobile) {
              setMobileOpen(false);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={isMobile ? "Close sidebar" : isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
          aria-label={isMobile ? "Close sidebar" : isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
        >
          {isMobile ? <X size={18} /> : isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: theme === 'dark'
                    ? (isActive ? '#008060' : '#2A2A2A')
                    : 'white',
                  color: theme === 'dark'
                    ? 'white'
                    : (isActive ? "#008060" : "#7E7E7E"),
                  fontWeight: isActive ? "600" : "500",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                    : "none",
                }}
              >
                <Icon size={20} />
                <span
                  className={!isMobile && isCollapsed ? "hidden" : "block"}
                  style={{ fontSize: "15px" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Left: Profile Card with Dropdown Actions */}
      <div className={`pb-6 transition-all ${!isMobile && isCollapsed ? "px-2" : "px-4"}`}>
        <div
          onClick={() => {
            if (isMobile) {
              setShowActions(!showActions);
              return;
            }

            if (!isCollapsed) {
              setShowActions(!showActions);
            }
          }}
          className={`rounded-xl flex flex-col gap-3 transition-all cursor-pointer select-none ${!isMobile && isCollapsed ? "p-2 items-center justify-center" : "p-4"}`}
          style={{
            background: theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Identity Group */}
          <div className={`flex items-center min-w-0 ${!isMobile && isCollapsed ? "justify-center w-full" : "justify-between gap-2 w-full"}`}>
            <div className={`flex items-center min-w-0 ${!isMobile && isCollapsed ? "justify-center" : "gap-3"}`}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{
                  background: theme === 'dark' ? '#008060' : '#0A2540',
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                DA
              </div>
              <div className={!isMobile && isCollapsed ? "hidden" : "min-w-0"}>
                <div
                  className="text-white truncate"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                >
                  Darshan
                </div>
                <div
                  className="text-white/80 truncate"
                  style={{ fontSize: "12px" }}
                >
                  d@example.com
                </div>
              </div>
            </div>

            {/* Expansion Arrow */}
            <div
              className={!isMobile && isCollapsed ? "hidden" : "text-white/60 transition-transform duration-200"}
              style={{ transform: showActions ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Collapsible Action List */}
          {showActions && (
            <div 
              className="flex flex-col gap-1 pt-2 border-t border-white/10 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition-colors w-full text-left cursor-pointer"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-xs font-semibold">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>

              {/* Settings */}
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition-colors w-full text-left cursor-pointer"
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={18} />
                <span className="text-xs font-semibold">Settings</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/85 hover:text-red-300 hover:bg-white/10 transition-colors w-full text-left cursor-pointer"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={18} />
                <span className="text-xs font-semibold">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
