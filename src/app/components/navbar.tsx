import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Home,
  Plus,
  History,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "./ui/use-mobile";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const cleanName = name.includes("@") ? name.split("@")[0] : name;
    const parts = cleanName.split(/[ ._-]/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  // Collapse profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track scroll positioning and directions
  useEffect(() => {
    let lastScrollY = window.scrollY;

    if (window.scrollY > 10) {
      setIsScrolledDown(true);
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 10) {
        setIsScrolledDown(false);
      } else if (currentScrollY > lastScrollY + 2) {
        setIsScrolledDown(true);
      } else if (currentScrollY < lastScrollY - 2) {
        setIsScrolledDown(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentPath = location.pathname;
  const isIslandOpened = isHovered || !isScrolledDown || isExpanded;

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 select-none animate-in fade-in slide-in-from-top-4 duration-500 ${className}`}
      ref={cardRef}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        className="dynamic-island-container text-white flex flex-col items-center overflow-hidden"
        style={{
          width: isIslandOpened ? "min(560px, calc(100vw - 32px))" : "190px",
          height: isExpanded ? (isMobile ? "270px" : "165px") : "44px",
          borderRadius: isExpanded ? "28px" : "22px",
        }}
      >
        {/* Row 1: Compact View or Expanded Navigation Bar */}
        <div className="flex items-center justify-between w-full h-[42px] px-3.5 flex-shrink-0">
          
          {/* Active / Idle State Left Section */}
          <div 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {/* Finch AI Micro-emblem */}
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#059669] shadow-sm">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v4c0 .5-.2 1-.6 1.4-.4.4-.9.6-1.4.6H6" />
                <path d="M18 14H6" />
              </svg>
            </div>
            
            {/* Compact Indicator text */}
            {!isIslandOpened && (
              <span className="text-xs font-black tracking-tight text-slate-100 flex items-center gap-1.5 animate-in fade-in duration-300">
                Finch AI
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              </span>
            )}
          </div>
 
          {/* Navigation Links (Visible when hovered/opened) */}
          {isIslandOpened && (
            <nav className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
              {[
                { path: "/dashboard", label: "Dashboard", icon: Home },
                { path: "/ocr-entry", label: "Scan Bill", icon: Plus },
                { path: "/history", label: "Logs", icon: History },
              ].map((route) => {
                const Icon = route.icon;
                const isActive = currentPath === route.path;
                return (
                  <button
                    key={route.path}
                    onClick={() => navigate(route.path)}
                    className={`h-7 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? "bg-white/15 text-[#10B981]" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                    }`}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{route.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
 
          {/* Right Section: Compact user avatar or Profile action dropdown button */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt="Avatar" 
                className="w-6 h-6 rounded-full object-cover border border-white/10 shadow-inner"
              />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white bg-slate-800 text-[10px] font-bold border border-white/10 shadow-inner">
                {getInitials(user?.name || user?.email || "User")}
              </div>
            )}
            {isIslandOpened && (
              <ChevronDown 
                size={12} 
                className="transition-transform duration-300 text-slate-400"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            )}
          </div>
        </div>

        {/* Bottom Section: Expandable Menu Options (Visible when expanded) */}
        <div 
          className="w-full flex flex-col sm:flex-row gap-4 px-4 mt-2 border-t border-white/5 pt-3 transition-all duration-300 ease-in-out"
          style={{
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }}
        >
          {/* Profile Details Panel (Real User Info, Interactable) */}
          <div 
            onClick={() => {
              navigate("/settings");
              setIsExpanded(false);
            }}
            className="flex-1 min-w-0 flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors cursor-pointer group"
          >
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-slate-800 text-xs font-bold border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                {getInitials(user?.name || user?.email || "User")}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-extrabold text-white truncate">{user?.name || "User"}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || "user@example.com"}</div>
            </div>
          </div>

          {/* Menu Action Options */}
          <div className="w-full sm:w-44 flex flex-col gap-1.5 flex-shrink-0 justify-center">
            {/* Theme switcher option */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors w-full cursor-pointer hover:bg-white/10 duration-150 text-slate-300 hover:text-white"
            >
              {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-emerald-400" />}
              <span className="text-[10px] font-bold uppercase tracking-wider">Theme</span>
            </button>

            {/* Settings Option */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/settings");
                setIsExpanded(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors w-full cursor-pointer hover:bg-white/10 duration-150 text-slate-300 hover:text-white"
            >
              <Settings size={13} className="text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
            </button>

            {/* Logout Option */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
                setIsExpanded(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors w-full cursor-pointer hover:bg-red-500/20 text-red-400 duration-150"
            >
              <LogOut size={13} className="text-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
