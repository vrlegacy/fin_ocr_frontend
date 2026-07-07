import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/navbar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { User, Mail, Shield, Calendar, Edit2, Check, X } from "lucide-react";

export function SettingsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setUsername(user.name || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      if (updateProfile) {
        await updateProfile(username);
        setIsEditing(false);
        toast.success("Profile saved successfully!");
      } else {
        toast.error("Update profile not supported in this session");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const cleanName = name.includes("@") ? name.split("@")[0] : name;
    const parts = cleanName.split(/[ ._-]/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex min-h-screen transition-colors duration-300 flex-col bg-transparent relative pb-16">
      <Navbar />

      <div className="flex-1 px-4 pb-6 md:p-8 pt-24 md:pt-28 min-w-0 max-w-3xl mx-auto w-full animate-in fade-in duration-300">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/dashboard")} className="cursor-pointer">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings & Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-1.5">
            Settings & Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Manage your personal profile and account credentials.
          </p>
        </div>

        {/* Premium Profile Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-900/40 dark:to-slate-950/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Avatar Section */}
            <div className="flex-shrink-0 relative group">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#10B981] shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white bg-slate-800 text-3xl font-bold border-2 border-[#10B981] shadow-lg">
                  {getInitials(user?.name || user?.email || "User")}
                </div>
              )}
            </div>

            {/* User Details Form Section */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex justify-between items-center border-b pb-3 mb-2 border-slate-200/20">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Profile Details</h3>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="h-8 px-3 rounded-lg text-xs font-semibold glass-button border border-slate-200 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Edit2 size={12} className="mr-1.5" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setUsername(user?.name || "");
                      }}
                      variant="outline"
                      className="h-8 px-3 rounded-lg text-xs font-semibold text-red-500 border-red-200/20 hover:bg-red-50 cursor-pointer"
                    >
                      <X size={12} className="mr-1.5" /> Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="h-8 px-3 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-[#059669] text-white border-0 cursor-pointer active:scale-95 duration-100"
                    >
                      <Check size={12} className="mr-1.5" /> Save
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Username */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <User size={13} className="text-[#10B981]" /> Username / Display Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full h-10 px-3 border rounded-xl text-sm font-semibold transition-all duration-200 glass-input ${
                      isEditing 
                        ? "border-[#10B981] focus:border-[#10B981] focus:outline-none" 
                        : "border-transparent opacity-80 cursor-not-allowed bg-transparent"
                    }`}
                  />
                </div>

                {/* Email Address (Read-only) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Mail size={13} className="text-[#10B981]" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full h-10 px-3 border border-transparent rounded-xl text-sm font-semibold opacity-60 cursor-not-allowed bg-transparent"
                  />
                </div>

                {/* Account Created (Read-only) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#10B981]" /> Account Member Since
                  </label>
                  <input
                    type="text"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}
                    disabled
                    className="w-full h-10 px-3 border border-transparent rounded-xl text-sm font-semibold opacity-60 cursor-not-allowed bg-transparent"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}