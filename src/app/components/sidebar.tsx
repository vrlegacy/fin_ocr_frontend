import { useState } from "react";
import {
  Upload,
  History,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { AppLogo } from "./logo";
import { useTheme } from "../context/ThemeContext";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showActions, setShowActions] = useState(false);

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: Upload },
    { label: "History", path: "/history", icon: History },
  ];

  return (
    <div
      className={`w-64 flex-shrink-0 flex flex-col fixed left-0 top-0 ${className}`}
      style={{
        background: theme === 'dark' ? '#0F172A' : '#065F46',
        height: "100vh",
        transition: 'background-color 0.3s ease'
      }}
    >
      {/* Top Left: Logo */}
      <div className="px-6 py-8 flex items-center">
        <AppLogo />
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
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: theme === 'dark'
                    ? (isActive ? '#10B981' : '#1E293B')
                    : 'white',
                  color: theme === 'dark'
                    ? 'white'
                    : (isActive ? "#065F46" : "#6B7280"),
                  fontWeight: isActive ? "600" : "500",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                    : "none",
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: "15px" }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Left: Profile Card with Dropdown Actions */}
      <div className="px-4 pb-6">
        <div
          onClick={() => setShowActions(!showActions)}
          className="p-4 rounded-xl flex flex-col gap-3 transition-all cursor-pointer select-none"
          style={{
            background: theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Identity Group */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{
                  background: theme === 'dark' ? '#10B981' : '#047857',
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                DA
              </div>
              <div className="min-w-0">
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
              className="text-white/60 transition-transform duration-200"
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
  );
}