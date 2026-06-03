import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Copy,
  Check,
  Pencil,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

export function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { theme } = useTheme();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});

  // Add field states
  const [isAddingField, setIsAddingField] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleToggleEdit = (key: string) => {
    const isCurrentlyEditing = !!editingFields[key];
    setEditingFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    
    if (isCurrentlyEditing) {
      toast.success(`Saved "${key}" field successfully`);
    } else {
      toast.info(`Editing "${key}" field`);
    }
  };

  // Simulated file metadata (In production, fetch this via id)
  const fileMeta = {
    name: "patient_form_01.pdf", // swap with "patient_form_01.png" to test image preview
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Demo PDF URL
    // url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000", // Demo Image URL
    uploadedAt: "29 May 2026",
    size: "1.2 MB",
  };

  const isPdf = fileMeta.name.toLowerCase().endsWith(".pdf");

  const [extractedData, setExtractedData] = useState<Record<string, string>>({
    "Patient Name": "Darshan Kumar",
    "Gender": "Male",
    "Date of Birth": "12 March 1995",
    "Blood Group": "O+",
    "Contact Number": "+91 98765 43210",
    "Email Address": "darshan@example.com",
    "Date of Examination": "29 May 2026",
    "Referred Doctor": "Dr. Aditi Sharma, MD",
    "Test Performed": "HbA1c & Fasting Blood Sugar",
    "HbA1c Value": "7.2% (High)",
    "Fasting Blood Sugar": "142 mg/dL",
    "Primary Diagnosis": "Type 2 Diabetes Mellitus",
  });

  const handleCopyField = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(`Copied "${field}" value to clipboard!`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleCopyAllData = () => {
    const textToCopy = Object.entries(extractedData)
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");
    
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    toast.success("Copied all extracted fields to clipboard!");
    setTimeout(() => {
      setCopiedAll(false);
    }, 2000);
  };

  const handleSaveToDatabase = async () => {
    try {
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaved(true);
      toast.success("All record changes successfully synchronized and saved to database!");
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to save records to database");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setExtractedData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDeleteField = (key: string) => {
    setExtractedData((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    toast.warning(`Field "${key}" removed successfully`);
  };

  const handleAddField = () => {
    const key = newKey.trim();
    const val = newValue.trim();
    if (!key) {
      toast.error("Field name cannot be empty");
      return;
    }
    if (extractedData[key]) {
      toast.error(`Field "${key}" already exists`);
      return;
    }
    setExtractedData((prev) => ({
      ...prev,
      [key]: val,
    }));
    toast.success(`Field "${key}" added successfully`);
    setNewKey("");
    setNewValue("");
    setIsAddingField(false);
  };

  return (
    <div 
      className="flex min-h-screen transition-colors duration-300" 
      style={{ background: theme === 'dark' ? '#0F172A' : '#F8FAFC' }}
    >
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 md:p-8 flex flex-col h-screen overflow-y-auto">
        {/* Back Navigation Bar */}
        <div className="mb-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="px-0 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-transparent transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Two Column Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px] items-stretch pb-6">
          
          {/* LEFT PANEL: Document Metadata & Preview Panel (40% width) */}
          <div className="lg:col-span-5 flex flex-col">
            <div 
              className="rounded-3xl p-4 border flex-1 flex flex-col overflow-hidden min-h-[450px] lg:min-h-0 transition-colors"
              style={{ 
                background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                borderColor: theme === 'dark' ? '#334155' : 'rgba(226, 232, 240, 0.6)',
                boxShadow: theme === 'dark' ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Document Header in Place of Original Text */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b transition-colors" style={{ borderColor: theme === 'dark' ? '#334155' : '#F1F5F9' }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all"
                    style={{
                      background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
                      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                      color: theme === 'dark' ? '#94A3B8' : '#64748B'
                    }}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 
                      className="font-bold truncate max-w-[150px] transition-colors"
                      style={{ fontSize: "14px", color: theme === 'dark' ? '#F1F5F9' : '#0F172A' }}
                    >
                      {fileMeta.name}
                    </h3>
                    <p style={{ fontSize: "11px", color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                      Uploaded {fileMeta.uploadedAt} · {fileMeta.size}
                    </p>
                  </div>
                </div>
                <Badge
                  className="rounded-md px-2.5 py-1 font-semibold border shadow-none pointer-events-none self-start sm:self-auto text-[10px]"
                  style={{ 
                    background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4', 
                    color: theme === 'dark' ? '#10B981' : '#166534',
                    borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#BBF7D0' 
                  }}
                >
                  Extraction Complete
                </Badge>
              </div>
              
              {/* Document Preview Embed */}
              <div 
                className="rounded-2xl flex-1 overflow-hidden relative flex items-center justify-center border transition-colors"
                style={{ 
                  background: theme === 'dark' ? '#0F172A' : '#F1F5F9',
                  borderColor: theme === 'dark' ? '#334155' : '#E2E8F0'
                }}
              >
                {isPdf ? (
                  <object
                    data={`${fileMeta.url}#toolbar=1&navpanes=0&scrollbar=1`}
                    type="application/pdf"
                    className="w-full h-full rounded-2xl"
                  >
                    <iframe
                      src={`${fileMeta.url}#toolbar=1`}
                      className="w-full h-full border-none rounded-2xl"
                      title="PDF Preview"
                    />
                  </object>
                ) : (
                  <img
                    src={fileMeta.url}
                    alt="Original Uploaded Source"
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Clean Extracted Fields Form (60% width) */}
          <div className="lg:col-span-7 flex flex-col">
            <div
              className="rounded-3xl p-6 border flex flex-col h-full transition-colors"
              style={{ 
                background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                borderColor: theme === 'dark' ? '#334155' : 'rgba(226, 232, 240, 0.6)',
                boxShadow: theme === 'dark' ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Header with Title and Fixed Actions */}
              <div 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b mb-6 transition-colors"
                style={{ borderColor: theme === 'dark' ? '#334155' : '#F1F5F9' }}
              >
                <h2 
                  className="tracking-tight transition-colors" 
                  style={{ fontSize: "20px", fontWeight: "600", color: theme === 'dark' ? '#F1F5F9' : '#0F172A' }}
                >
                  Extracted Fields
                </h2>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleCopyAllData}
                    variant="outline"
                    className="h-10 px-4 rounded-xl font-medium border transition-colors cursor-pointer text-xs flex items-center justify-center flex-1 sm:flex-initial"
                    style={{
                      background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                      color: theme === 'dark' ? '#F1F5F9' : '#64748B'
                    }}
                  >
                    {copiedAll ? (
                      <>
                        <Check size={14} className="mr-1.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="mr-1.5" />
                        Copy all data
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSaveToDatabase}
                    disabled={saving}
                    className="h-10 px-5 rounded-xl text-white text-xs font-medium shadow-sm transition-all hover:opacity-95 cursor-pointer flex items-center justify-center flex-1 sm:flex-initial"
                    style={{
                      background: saved ? "#15803D" : "#10B981",
                    }}
                  >
                    {saving ? (
                      "Syncing..."
                    ) : saved ? (
                      <>
                        <Check size={14} className="mr-1.5" />
                        Saved
                      </>
                    ) : (
                      "Save To Database"
                    )}
                  </Button>
                </div>
              </div>

              {/* Add Custom Field row */}
              <div className="mb-4">
                {isAddingField ? (
                  <div
                    className="p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in duration-200"
                    style={{
                      background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
                      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                    }}
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label 
                          className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
                          style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}
                        >
                          Field Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Heart Rate"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border text-xs focus:outline-none transition-all"
                          style={{
                            background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                            borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                            color: theme === 'dark' ? '#F1F5F9' : '#0F172A'
                          }}
                        />
                      </div>
                      <div>
                        <label 
                          className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
                          style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}
                        >
                          Field Value
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 72 bpm"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border text-xs focus:outline-none transition-all"
                          style={{
                            background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                            borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                            color: theme === 'dark' ? '#F1F5F9' : '#0F172A'
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center mt-3 sm:mt-0">
                      <Button
                        size="sm"
                        onClick={handleAddField}
                        className="h-9 px-3 text-white text-xs font-semibold cursor-pointer"
                        style={{ background: "#10B981" }}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsAddingField(false);
                          setNewKey("");
                          setNewValue("");
                        }}
                        className="h-9 px-3 text-xs text-slate-500 dark:text-slate-400 hover:bg-transparent cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsAddingField(true)}
                    variant="outline"
                    className="w-full h-10 border border-dashed rounded-xl text-xs font-semibold cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center justify-center"
                    style={{
                      borderColor: theme === 'dark' ? '#475569' : '#CBD5E1',
                      color: theme === 'dark' ? '#CBD5E1' : '#64748B'
                    }}
                  >
                    <Plus size={14} className="mr-1.5" />
                    Add Custom Field
                  </Button>
                )}
              </div>

              {/* Form Fields Stack */}
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-4 rounded-xl flex items-center gap-4 border transition-all"
                    style={{
                      background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
                      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                    }}
                  >
                    <div className="flex-1">
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          color: theme === 'dark' ? '#94A3B8' : '#94A3B8',
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {key}
                      </div>

                      <input
                        value={value}
                        readOnly={!editingFields[key]}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className={`w-full outline-none bg-transparent transition-all border-b ${
                          editingFields[key]
                            ? "border-slate-300 dark:border-slate-600 pb-0.5 text-slate-900 dark:text-white"
                            : "border-transparent text-slate-700 dark:text-slate-300 pointer-events-none"
                        }`}
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyField(key, value)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer"
                        style={{
                          background: theme === 'dark'
                            ? (copiedField === key ? 'rgba(16, 185, 129, 0.15)' : '#1E293B')
                            : (copiedField === key ? "#F0FDF4" : "#FFFFFF"),
                          borderColor: theme === 'dark'
                            ? (copiedField === key ? '#10B981' : '#334155')
                            : (copiedField === key ? "#BBF7D0" : "#E2E8F0"),
                          color: theme === 'dark' ? '#F1F5F9' : '#0F172A'
                        }}
                        title="Copy value"
                        aria-label="Copy value"
                      >
                        {copiedField === key ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} className="text-slate-400 hover:text-slate-300" />
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleToggleEdit(key)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer"
                        style={{
                          background: theme === 'dark'
                            ? (editingFields[key] ? 'rgba(59, 130, 246, 0.15)' : '#1E293B')
                            : (editingFields[key] ? "#EFF6FF" : "#FFFFFF"),
                          borderColor: theme === 'dark'
                            ? (editingFields[key] ? '#3B82F6' : '#334155')
                            : (editingFields[key] ? "#BFDBFE" : "#E2E8F0"),
                          color: theme === 'dark' ? '#F1F5F9' : '#0F172A'
                        }}
                        title={editingFields[key] ? "Save changes" : "Edit field"}
                        aria-label={editingFields[key] ? "Save changes" : "Edit field"}
                      >
                        {editingFields[key] ? (
                          <Save size={14} className="text-blue-500" />
                        ) : (
                          <Pencil size={14} className="text-slate-400 hover:text-slate-300" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteField(key)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
                        style={{
                          background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                          borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                          color: '#EF4444'
                        }}
                        title="Delete field"
                        aria-label="Delete field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}