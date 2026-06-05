import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Files,
  Users,
  Stethoscope,
  Search,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  UploadCloud,
  Trash2,
} from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();

  // Drag & Drop Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Core Mock Datastore
  const [recentUploads, setRecentUploads] = useState([
    {
      id: "1",
      fileName: "patient_form_01.pdf",
      patient: "Darshan Kumar",
      date: "29 May 2026",
      type: "Pathology",
      status: "Completed",
    },
    {
      id: "2",
      fileName: "medical_record_02.pdf",
      patient: "Sarah Johnson",
      date: "28 May 2026",
      type: "Prescription",
      status: "Processing",
    },
    {
      id: "3",
      fileName: "lab_results_03.jpg",
      patient: "Michael Chen",
      date: "27 May 2026",
      type: "Lab Report",
      status: "Failed",
    },
  ]);

  // Analytics Metrics Dataset (Updated with Matching Green Theme Accents)
  const metrics = [
    {
      label: "Total Uploads",
      value: "1,248",
      subtext: "+12% vs last month",
      icon: Files,
      iconColor: "#008060",
    },

    {
      label: "Processing File Count",
      value: "5",
      subtext: "Currently parsing",
      icon: RefreshCw,
      iconColor: "#3B82F6",
    },
    {
      label: "Error File Count",
      value: "8",
      subtext: "Requires review",
      icon: AlertCircle,
      iconColor: "#EF4444",
    },
    {
      label: "Successful File Count",
      value: "1,223",
      subtext: "97.9% success rate",
      icon: CheckCircle,
      iconColor: "#10B981",
    },
  ];

  const simulateUpload = (file: File) => {
    setUploadingFile(file);
    setUploadProgress(0);
    toast.loading(`Uploading "${file.name}"...`, { id: "upload-toast" });
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Add file to recent uploads list
          const newUpload = {
            id: String(Date.now()),
            fileName: file.name,
            patient: "Pending Extraction...",
            date: "Today",
            type: file.type.includes("pdf") ? "Pathology" : "Lab Report",
            status: "Processing",
          };
          
          setRecentUploads((prevList) => [newUpload, ...prevList]);
          toast.success(`"${file.name}" uploaded and added to processing pipeline!`, { id: "upload-toast" });
          
          // Close modal and reset states after a brief delay
          setTimeout(() => {
            setIsUploadOpen(false);
            setUploadingFile(null);
            setUploadProgress(0);
          }, 800);
          
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const handleDeleteUpload = (id: string, fileName: string) => {
    setRecentUploads((prev) => prev.filter((item) => item.id !== id));
    toast.warning(`Removed "${fileName}" from pipeline activities`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return {
          background: "#F0FDF4",
          color: "#166534",
          borderColor: "#BBF7D0",
        };
      case "Processing":
        return {
          background: "#FEF3C7",
          color: "#92400E",
          borderColor: "#FDE68A",
        };
      case "Failed":
        return {
          background: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#FCA5A5",
        };
      default:
        return {
          background: "#E5E5E5",
          color: "#3A3A3A",
          borderColor: "#E5E5E5",
        };
    }
  };

  const filteredUploads = recentUploads.filter(
    (upload) =>
      upload.fileName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      upload.patient
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{
        background: theme === 'dark' ? '#1C1C1C' : '#F5F5F5'
      }}
    >
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight transition-colors"
            style={{ color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C' }}
          >
            Dashboard
          </h1>
          <p
            className="mt-1.5 text-sm transition-colors"
            style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
          >
            Monitor ingestion metrics, process incoming medical
            forms, and audit system logs.
          </p>
        </div>

        {/* 1. Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div
                key={i}
                className="rounded-2xl p-5 border flex items-start justify-between transition-all duration-300"
                style={{
                  background: theme === 'dark' ? '#2A2A2A' : '#FFFFFF',
                  borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
                  boxShadow: theme === 'dark'
                    ? '0 4px 20px -2px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px -2px rgba(15, 23, 42, 0.02)',
                }}
              >
                <div>
                  <p
                    className="text-xs font-semibold tracking-wider uppercase mb-1 transition-colors"
                    style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                  >
                    {metric.label}
                  </p>
                  <h3
                    className="text-2xl font-bold transition-colors"
                    style={{ color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C' }}
                  >
                    {metric.value}
                  </h3>
                  <span
                    className="text-[11px] font-medium block mt-1 transition-colors"
                    style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                  >
                    {metric.subtext}
                  </span>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all"
                  style={{
                    background: theme === 'dark' ? '#1C1C1C' : '#F5F5F5',
                    borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
                    color: metric.iconColor
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Simple Button Upload Card */}
        <div
          className="rounded-2xl p-6 border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
          style={{
            background: theme === 'dark' ? '#2A2A2A' : '#FFFFFF',
            borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
            boxShadow: theme === 'dark'
              ? '0 4px 20px -2px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px -2px rgba(15, 23, 42, 0.02)',
          }}
        >
          <div>
            <h2
              className="text-lg font-bold transition-colors"
              style={{ color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C' }}
            >
              Process Document
            </h2>
            <p
              className="text-xs mt-0.5 transition-colors"
              style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
            >
              Ingest structured medical configurations via PDF,
              JPG, or PNG files.
            </p>
          </div>

          <div>
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="h-11 px-5 rounded-xl text-white text-sm font-medium transition-all shadow-sm w-full sm:w-auto border border-transparent cursor-pointer"
              style={{
                background: "#008060",
              }}
            >
              <Upload size={16} className="mr-2" />
              Upload a file
            </Button>
          </div>
        </div>

        {/* 3. Recent Uploads Grid Module */}
        <div
          className="rounded-3xl border overflow-hidden transition-all duration-300"
          style={{
            background: theme === 'dark' ? '#2A2A2A' : '#FFFFFF',
            borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
            boxShadow: theme === 'dark'
              ? '0 10px 30px rgba(0, 0, 0, 0.3)'
              : '0 10px 30px rgba(0,0,0,0.02)',
          }}
        >
          {/* Section Controller Panel */}
          <div
            className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            style={{ borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5' }}
          >
            <div>
              <h2
                className="text-lg font-bold transition-colors"
                style={{ color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C' }}
              >
                Recent Uploads
              </h2>
              <p
                className="text-xs mt-0.5 transition-colors"
                style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
              >
                Real-time tracking of parsed documents.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                size={16}
              />
              <input
                placeholder="Filter files or patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border focus:outline-none transition-all"
                style={{
                  background: theme === 'dark' ? '#1C1C1C' : 'rgba(248, 250, 252, 0.5)',
                  borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
                  color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C',
                }}
              />
            </div>
          </div>

          {/* Desktop Tabular Representation */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b text-left transition-all"
                  style={{
                    background: theme === 'dark' ? '#1C1C1C' : 'rgba(248, 250, 252, 0.4)',
                    borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
                  }}
                >
                  <th
                    className="py-3 px-6 font-semibold text-xs uppercase tracking-wider transition-colors"
                    style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                  >
                    Patient Entity
                  </th>
                  <th
                    className="py-3 px-6 font-semibold text-xs uppercase tracking-wider transition-colors"
                    style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                  >
                    Timestamp
                  </th>
                  <th
                    className="py-3 px-6 font-semibold text-xs uppercase tracking-wider transition-colors"
                    style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                  >
                    Status Node
                  </th>
                  <th
                    className="py-3 px-6 text-right font-semibold text-xs uppercase tracking-wider transition-colors"
                    style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5' }}>
                {filteredUploads.map((upload) => (
                  <tr
                    key={upload.id}
                    className="transition-all"
                    style={{
                      background: theme === 'dark' ? '#2A2A2A' : 'transparent',
                    }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 border rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: theme === 'dark' ? '#1C1C1C' : '#F5F5F5',
                            borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
                            color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E',
                          }}
                        >
                          <FileText size={16} />
                        </div>
                        <span
                          className="font-medium text-sm truncate max-w-[200px] transition-colors"
                          style={{ color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C' }}
                        >
                          {upload.patient}
                        </span>
                      </div>
                    </td>
                    <td
                      className="py-4 px-6 text-xs font-medium transition-colors"
                      style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                    >
                      {upload.date}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        className="rounded-md font-semibold px-2.5 py-0.5 border text-[11px] shadow-none cursor-default"
                        style={getStatusStyle(upload.status)}
                      >
                        {upload.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg h-8 text-xs transition-all font-medium cursor-pointer"
                          style={{
                            background: theme === 'dark' ? '#008060' : '#FFFFFF',
                            borderColor: theme === 'dark' ? '#008060' : '#0A2540',
                            color: theme === 'dark' ? '#FFFFFF' : '#0A2540',
                          }}
                          onClick={() => navigate(`/result/${upload.id}`)}
                        >
                          View Output
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                          onClick={() => handleDeleteUpload(upload.id, upload.fileName)}
                          title="Remove Activity"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Display Blocks */}
          <div className="md:hidden divide-y" style={{ borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5' }}>
            {filteredUploads.map((upload) => (
              <div
                key={upload.id}
                className="p-4 flex flex-col gap-3 transition-all"
                style={{ background: theme === 'dark' ? '#2A2A2A' : '#FFFFFF' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 border rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: theme === 'dark' ? '#1C1C1C' : '#F5F5F5',
                        borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
                        color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E',
                      }}
                    >
                      <FileText size={16} />
                    </div>
                    <div>
                      <p
                        className="font-semibold text-sm truncate max-w-[180px] transition-colors"
                        style={{ color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C' }}
                      >
                        {upload.patient}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className="rounded-md font-semibold px-2 py-0.5 border text-[10px]"
                    style={getStatusStyle(upload.status)}
                  >
                    {upload.status}
                  </Badge>
                </div>
                <div
                  className="flex items-center justify-between mt-1 pt-2 border-t transition-colors"
                  style={{ borderColor: theme === 'dark' ? '#3A3A3A' : '#F5F5F5' }}
                >
                  <span
                    className="text-xs font-medium transition-colors"
                    style={{ color: theme === 'dark' ? '#7E7E7E' : '#7E7E7E' }}
                  >
                    {upload.date}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs transition-all font-medium cursor-pointer"
                      style={{
                        background: theme === 'dark' ? '#008060' : '#FFFFFF',
                        borderColor: theme === 'dark' ? '#008060' : '#0A2540',
                        color: theme === 'dark' ? '#FFFFFF' : '#0A2540',
                      }}
                      onClick={() => navigate(`/result/${upload.id}`)}
                    >
                      View Output
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                      onClick={() => handleDeleteUpload(upload.id, upload.fileName)}
                      title="Remove Activity"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drag & Drop Upload Modal */}
        {isUploadOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
              onClick={() => {
                if (!uploadingFile) {
                  setIsUploadOpen(false);
                }
              }}
            />

            {/* Modal Card */}
            <div 
              className="relative w-full max-w-xl rounded-3xl border p-6 md:p-8 overflow-hidden shadow-2xl z-10 transition-all duration-300 transform scale-100"
              style={{
                background: theme === 'dark' ? '#2A2A2A' : '#FFFFFF',
                borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E5E5',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 
                  className="text-lg font-bold"
                  style={{ color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C' }}
                >
                  Upload documents
                </h3>
                
                {!uploadingFile && (
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close dialog"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div className="py-6">
                {!uploadingFile ? (
                  /* Drag Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                      isDragging 
                        ? 'border-[#10B981] bg-[#10B981]/5' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-transform duration-300"
                      style={{
                        background: theme === 'dark' ? '#1C1C1C' : '#F5F5F5',
                        color: isDragging ? '#10B981' : (theme === 'dark' ? '#7E7E7E' : '#7E7E7E'),
                        transform: isDragging ? 'scale(1.1) translateY(-4px)' : 'none'
                      }}
                    >
                      <UploadCloud size={32} className={isDragging ? 'animate-bounce' : ''} />
                    </div>

                    <p 
                      className="text-sm font-semibold mb-2"
                      style={{ color: theme === 'dark' ? '#E5E5E5' : '#2A2A2A' }}
                    >
                      Drag and drop files to upload
                    </p>
                    
                    <p 
                      className="text-xs text-slate-400 mb-6"
                    >
                      or select files from your device
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 px-6 rounded-xl text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                      style={{
                        background: '#008060',
                      }}
                    >
                      Select Files
                    </Button>
                  </div>
                ) : (
                  /* Upload Progress Panel */
                  <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-[#10B981] bg-[#10B981]/10"
                    >
                      <FileText size={22} />
                    </div>
                    
                    <span 
                      className="text-sm font-semibold truncate max-w-xs mb-1"
                      style={{ color: theme === 'dark' ? '#E5E5E5' : '#1C1C1C' }}
                    >
                      {uploadingFile.name}
                    </span>
                    
                    <span 
                      className="text-xs text-slate-400 mb-6"
                    >
                      {(uploadingFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>

                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                      <div 
                        className="bg-[#10B981] h-full transition-all duration-150 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between w-full text-xs font-medium text-slate-400">
                      <span>
                        {uploadProgress < 100 
                          ? `Uploading... ${uploadProgress}%` 
                          : 'Extraction Triggered!'
                        }
                      </span>
                      <span>
                        {uploadProgress < 100 ? 'Simulating' : 'Success'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>Supported files: PDF, JPG, JPEG, PNG</span>
                <span>Max size: 10MB</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}