import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useTheme } from "../context/ThemeContext";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";
import { useIsMobile } from "../components/ui/use-mobile";
import { toast } from "sonner";
import {
  Upload,
  Camera,
  FileText,
  Check,
  CheckCircle,
  AlertTriangle,
  X,
  Lock,
  Plus,
  Save,
  Search,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Info,
  User,
  Heart,
  Droplet,
  Shield,
  Activity
} from "lucide-react";
import confetti from "canvas-confetti";

// Medication / Condition Database
const DB = [
  { name: "Hydroxyzine", dose: "25mg / 50mg", cls: "Antihistamine", cat: "Allergy", lasa: null },
  { name: "Hydralazine", dose: "25mg / 50mg", cls: "Antihypertensive · Vasodilator", cat: "Cardiovascular", lasa: "Hydroxyzine" },
  { name: "Hydrochlorothiazide", dose: "12.5mg / 25mg", cls: "Thiazide diuretic", cat: "Cardiovascular", lasa: null },
  { name: "Hypertension", dose: "Diagnosis", cls: "Cardiovascular condition", cat: "Diagnosis", lasa: null },
  { name: "Hyperthyroidism", dose: "Diagnosis", cls: "Endocrine condition", cat: "Diagnosis", lasa: "Hypothyroidism" },
  { name: "Hypothyroidism", dose: "Diagnosis", cls: "Endocrine condition", cat: "Diagnosis", lasa: "Hyperthyroidism" },
  { name: "Metformin", dose: "500mg / 1000mg", cls: "Biguanide antidiabetic", cat: "Diabetes", lasa: null },
  { name: "Metoprolol", dose: "25mg / 50mg / 100mg", cls: "Beta-blocker", cat: "Cardiovascular", lasa: null },
  { name: "Metronidazole", dose: "200mg / 500mg", cls: "Antibiotic", cat: "Infection", lasa: null },
  { name: "Amlodipine", dose: "5mg / 10mg", cls: "Calcium channel blocker", cat: "Cardiovascular", lasa: "Amiodarone" },
  { name: "Amiodarone", dose: "100mg / 200mg", cls: "Antiarrhythmic", cat: "Cardiovascular", lasa: "Amlodipine" },
  { name: "Amoxicillin", dose: "250mg / 500mg", cls: "Penicillin antibiotic", cat: "Infection", lasa: null },
  { name: "Propranolol", dose: "10mg / 40mg", cls: "Beta-blocker", cat: "Cardiovascular", lasa: "Propofol" },
  { name: "Propofol", dose: "10mg/ml", cls: "IV anaesthetic", cat: "Anaesthesia", lasa: "Propranolol" },
  { name: "Atorvastatin", dose: "10mg / 40mg / 80mg", cls: "Statin", cat: "Cardiovascular", lasa: null },
];

const CAT_BG: Record<string, string> = {
  Cardiovascular: "rgba(239, 68, 68, 0.1)",
  Diabetes: "rgba(59, 130, 246, 0.1)",
  Infection: "rgba(245, 158, 11, 0.1)",
  Allergy: "rgba(16, 185, 129, 0.1)",
  Anaesthesia: "rgba(139, 92, 246, 0.1)",
  Diagnosis: "rgba(59, 130, 246, 0.1)",
  default: "rgba(148, 163, 184, 0.1)",
};

const CAT_COL: Record<string, string> = {
  Cardiovascular: "#EF4444",
  Diabetes: "#3B82F6",
  Infection: "#F59E0B",
  Allergy: "#10B981",
  Anaesthesia: "#8B5CF6",
  Diagnosis: "#3B82F6",
  default: "#7E7E7E",
};

const CAT_IC: Record<string, any> = {
  Cardiovascular: Heart,
  Diabetes: Droplet,
  Infection: Activity,
  Allergy: Shield,
  Anaesthesia: Activity,
  Diagnosis: Activity,
  default: FileText,
};

// String similarity score
function sim(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (b.startsWith(a)) return 1;
  let s = 0, ai = 0, bi = 0;
  while (ai < a.length && bi < b.length) {
    if (a[ai] === b[bi]) {
      s++;
      ai++;
      bi++;
    } else {
      bi++;
    }
  }
  return s / Math.max(a.length, b.length);
}

// Highlights matching query characters in results dropdown items
function hlMatch(name: string, q: string) {
  if (!q) return name;
  const nl = name.toLowerCase();
  const ql = q.toLowerCase();
  let r: React.ReactNode[] = [];
  let qi = 0;
  for (let i = 0; i < name.length; i++) {
    if (qi < ql.length && nl[i] === ql[qi]) {
      r.push(
        <span key={i} className="text-emerald-600 font-bold dark:text-emerald-400">
          {name[i]}
        </span>
      );
      qi++;
    } else {
      r.push(name[i]);
    }
  }
  return r;
}

// Character diff algorithm for look-alike sound-alike comparison highlights
function diffHl(a: string, b: string) {
  let out: React.ReactNode[] = [];
  let i = 0, j = 0;
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  let keyIndex = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && al[i] === bl[j]) {
      out.push(<span key={keyIndex++}>{b[j]}</span>);
      i++;
      j++;
    } else {
      let k = j;
      while (k < b.length && (i >= a.length || bl[k] !== al[i])) {
        k++;
      }
      out.push(
        <span
          key={keyIndex++}
          className="text-red-500 font-bold underline bg-red-50 dark:bg-red-950/40 px-0.5 rounded-sm"
        >
          {b.slice(j, k)}
        </span>
      );
      j = k;
      if (i < a.length) i++;
    }
  }
  return out;
}

export function OcrEntryPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isCollapsed } = useSidebarCollapsed();
  const isMobile = useIsMobile();

  // Workflow step: 1 (Scan), 2 (Review), 3 (Validate), 4 (Confirm), 5 (Success)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form patient metadata state
  const [patientName, setPatientName] = useState("Ahmed Al Rashidi");
  const [dob, setDob] = useState("12/04/1985");
  const [mrn, setMrn] = useState("AUH-2024-0291");
  const [genderPronouns, setGenderPronouns] = useState("Male (he/him)");
  const [nationalId, setNationalId] = useState("784-1985-1234567-1");
  const [emergencyContact, setEmergencyContact] = useState("Fatima Al Rashidi - +971 50 123 4567");
  const [preferredLanguage, setPreferredLanguage] = useState("Arabic");
  const [allergies, setAllergies] = useState("Penicillin");
  const [physician, setPhysician] = useState("Dr. Sarah Al Mansoori");
  const [chiefComplaint, setChiefComplaint] = useState("Severe itching and dizziness");
  const [symptomDuration, setSymptomDuration] = useState("Started 3 days ago");
  const [currentVitals, setCurrentVitals] = useState("BP 148/92 mmHg, HR 88 bpm, Temp 37.4 C, Weight 82 kg");
  const [painScale, setPainScale] = useState("6/10");

  // Diagnosis inputs
  const [primaryQuery, setPrimaryQuery] = useState("Hydr0xyzine 25mg");
  const [secondaryInput, setSecondaryInput] = useState("Hypertenslon");

  // Step 1: Upload simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Step 3: Autocomplete dropdown states
  const [acResults, setAcResults] = useState<any[]>([]);
  const [acSelected, setAcSelected] = useState<any | null>(null);
  const [acLasaPending, setAcLasaPending] = useState<any | null>(null);
  const [showDD, setShowDD] = useState(false);
  const [acFocused, setAcFocused] = useState(-1);

  // Step 3: Field completion milestones
  const [d1ok, setD1ok] = useState(false);
  const [d2ok, setD2ok] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Autocomplete Input Change
  const handleAcInput = (val: string) => {
    setPrimaryQuery(val);
    setAcSelected(null);
    setAcLasaPending(null);
    setAcFocused(-1);
    setD1ok(false);

    if (val.trim().length < 2) {
      setAcResults([]);
      setShowDD(false);
      return;
    }

    const queryStr = val.trim();
    const scored = DB.map((d) => ({
      ...d,
      score: sim(queryStr, d.name),
    }))
      .filter((d) => d.score > 0.22)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);

    setAcResults(scored);
    setShowDD(true);
  };

  // Keyboard navigation inside dropdown
  const handleAcKeyDown = (e: React.KeyboardEvent) => {
    if (!showDD || acResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcFocused((prev) => Math.min(prev + 1, acResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAcFocused((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (acFocused >= 0 && acResults[acFocused]) {
        selectAcItem(acResults[acFocused].name);
      }
    } else if (e.key === "Escape") {
      setShowDD(false);
    }
  };

  // Select an Autocomplete Item
  const selectAcItem = (name: string) => {
    const item = DB.find((d) => d.name === name);
    if (!item) return;

    setShowDD(false);

    if (item.lasa) {
      setAcLasaPending(item);
      setPrimaryQuery(item.name);
    } else {
      confirmAcItem(item);
    }
  };

  // Confirm final selection
  const confirmAcItem = (item: any) => {
    setAcSelected(item);
    setPrimaryQuery(item.name);
    setAcLasaPending(null);
    setD1ok(true);
    toast.success(`Confirmed Medication: ${item.name}`);
  };

  const handlePickLasa = (name: string) => {
    const item = DB.find((d) => d.name === name);
    if (!item) return;
    confirmAcItem(item);
  };

  const clearAc = () => {
    setAcSelected(null);
    setAcLasaPending(null);
    setPrimaryQuery("");
    setD1ok(false);
  };

  const applySecondaryCorrection = () => {
    setSecondaryInput("Hypertension");
    setD2ok(true);
    toast.success("Applied correction: Hypertension");
  };

  // Trigger step progress
  const goTo = (n: 1 | 2 | 3 | 4 | 5) => {
    setStep(n);
  };

  // Simulate file upload transition
  const handleFileUploadSim = () => {
    setIsUploading(true);
    setUploadProgress(0);
    toast.loading("Analyzing patient document via OCR...", { id: "ocr-toast" });

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setStep(2);
            toast.success("Document analyzed. 3 fields flagged for manual review.", { id: "ocr-toast" });
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleSave = () => {
    // Save confirmation trigger
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setStep(5);
    toast.success("Medical record synchronized and saved successfully!");
  };

  const resetAll = () => {
    setStep(1);
    setPatientName("Ahmed Al Rashidi");
    setDob("12/04/1985");
    setMrn("AUH-2024-0291");
    setGenderPronouns("Male (he/him)");
    setNationalId("784-1985-1234567-1");
    setEmergencyContact("Fatima Al Rashidi - +971 50 123 4567");
    setPreferredLanguage("Arabic");
    setAllergies("Penicillin");
    setPhysician("Dr. Sarah Al Mansoori");
    setChiefComplaint("Severe itching and dizziness");
    setSymptomDuration("Started 3 days ago");
    setCurrentVitals("BP 148/92 mmHg, HR 88 bpm, Temp 37.4 C, Weight 82 kg");
    setPainScale("6/10");
    setPrimaryQuery("Hydr0xyzine 25mg");
    setSecondaryInput("Hypertenslon");
    setAcSelected(null);
    setAcLasaPending(null);
    setD1ok(false);
    setD2ok(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowDD(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{
        background: theme === "dark" ? "#1C1C1C" : "#F5F5F5",
      }}
    >
      <Sidebar />

      <div
        className="flex-1 px-4 pb-6 md:p-8 pt-20 md:pt-8 w-full flex flex-col min-h-screen min-w-0"
        style={{
          marginLeft: isMobile ? 0 : isCollapsed ? "5rem" : "16rem",
          transition: "margin-left 0.25s ease-in-out"
        }}
      >
        {/* Navigation back and header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="px-0 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-transparent transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Stepper Header */}
        <div
          className="grid grid-cols-4 border rounded-2xl overflow-hidden mb-8 transition-colors select-none"
          style={{
            borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
            boxShadow: theme === "dark" ? "0 4px 15px rgba(0,0,0,0.2)" : "0 4px 15px rgba(0,0,0,0.02)",
          }}
        >
          {[
            { id: 1, step: "01", label: "Scan Form" },
            { id: 2, step: "02", label: "Review OCR" },
            { id: 3, step: "03", label: "Validate" },
            { id: 4, step: "04", label: "Confirm" },
          ].map((s) => {
            const isCompleted = step > s.id;
            const isActive = step === s.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  if (s.id < step) goTo(s.id as any);
                }}
                className={`py-3 px-2 text-center flex flex-col items-center justify-center cursor-pointer transition-all border-r last:border-r-0 ${
                  isActive
                    ? "bg-[#008060] text-[#E6F2EF] font-medium"
                    : isCompleted
                    ? "bg-[#0A2540] text-emerald-50 font-medium"
                    : "bg-slate-100 text-slate-400 dark:bg-[#2A2A2A] dark:text-slate-500"
                }`}
                style={{
                  borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                }}
              >
                <span className="text-[10px] sm:text-xs uppercase opacity-75 tracking-wider font-semibold mb-0.5">
                  {s.step}
                </span>
                <span className="text-xs md:text-sm hidden sm:block">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: SCAN PATIENT FORM */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between w-full animate-in fade-in duration-200">
            <div
              className="rounded-3xl p-6 md:p-8 border transition-all duration-300"
              style={{
                background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                boxShadow: theme === "dark" ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(15,23,42,0.02)",
              }}
            >
              <div className="flex items-center gap-3 border-b pb-4 mb-6" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                <FileText className="text-[#008060] dark:text-emerald-400" size={20} />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Upload Patient intake Form</h2>
              </div>

              {!isUploading ? (
                <div
                  onClick={handleFileUploadSim}
                  className="border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#008060] dark:hover:border-emerald-400 group"
                  style={{
                    borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                    background: theme === "dark" ? "#1C1C1C" : "#F5F5F5",
                  }}
                >
                  <Upload className="w-16 h-16 text-slate-400 group-hover:text-[#008060] dark:group-hover:text-emerald-400 transition-transform group-hover:-translate-y-1 mb-4" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Take a photo or upload the handwritten patient form
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    JPG · PNG · PDF formats accepted up to 10MB
                  </p>
                </div>
              ) : (
                <div className="p-8 border rounded-2xl flex flex-col items-center text-center" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                  <RefreshCw className="w-12 h-12 text-[#008060] dark:text-emerald-400 animate-spin mb-4" />
                  <h3 className="text-sm font-semibold mb-1 text-slate-800 dark:text-slate-200">Processing Medical File...</h3>
                  <span className="text-xs text-slate-400 mb-4">Reading handwritten lines and fields</span>
                  <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-[#008060] dark:bg-emerald-400 h-full transition-all duration-200 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{uploadProgress}% Complete</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 w-full max-w-xs mx-auto sm:max-w-none">
                <Button
                  onClick={handleFileUploadSim}
                  disabled={isUploading}
                  variant="outline"
                  className="rounded-xl h-11 px-5 font-semibold text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto"
                >
                  <Camera size={14} className="mr-2" />
                  Camera Scan
                </Button>
                <Button
                  onClick={handleFileUploadSim}
                  disabled={isUploading}
                  variant="outline"
                  className="rounded-xl h-11 px-5 font-semibold text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto"
                >
                  <Upload size={14} className="mr-2" />
                  Upload File
                </Button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleFileUploadSim}
                disabled={isUploading}
                className="h-11 px-6 rounded-xl font-semibold bg-[#008060] hover:bg-[#00664d] text-[#E6F2EF] border-0 cursor-pointer flex items-center"
              >
                Simulate OCR scan <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW OCR EXTRACTIONS */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between w-full animate-in fade-in duration-200">
            <div className="space-y-6">
              {/* Extracted Text Pane */}
              <div
                className="rounded-3xl p-6 border transition-all duration-300"
                style={{
                  background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                  borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                  boxShadow: theme === "dark" ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(15,23,42,0.02)",
                }}
              >
                <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                  <div className="flex items-center gap-3">
                    <FileText className="text-amber-500" size={20} />
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">OCR Extracted Text</h2>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold uppercase text-[10px] tracking-wider py-0.5 border-transparent">
                    Auto-extracted
                  </Badge>
                </div>

                <div
                  className="rounded-xl p-4 font-mono text-xs leading-relaxed mb-4 border"
                  style={{
                    background: theme === "dark" ? "#1C1C1C" : "#F5F5F5",
                    borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                    color: theme === "dark" ? "#7E7E7E" : "#7E7E7E",
                  }}
                >
                  Patient: <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1 rounded-sm">{patientName}</span>&nbsp;&nbsp;DOB: {dob}&nbsp;&nbsp;MRN: <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1 rounded-sm">{mrn}</span><br />
                  Gender / Pronouns: {genderPronouns}&nbsp;&nbsp;National ID: <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1 rounded-sm">{nationalId}</span><br />
                  Emergency Contact: <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1 rounded-sm">{emergencyContact}</span><br />
                  Preferred Language: {preferredLanguage}&nbsp;&nbsp;Chief Complaint: {chiefComplaint}<br />
                  Onset / Duration: {symptomDuration}&nbsp;&nbsp;Current Vitals: <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1 rounded-sm">{currentVitals}</span><br />
                  Pain Scale: {painScale}&nbsp;&nbsp;Diagnosis: <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1 rounded-sm">Hydr0xyzine 25mg</span>&nbsp;&nbsp;Secondary: <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1 rounded-sm">Hypertenslon</span><br />
                  Allergies: {allergies}&nbsp;&nbsp;Physician: {physician}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={15} />
                  <span>Review highlighted OCR fields, especially identifiers, emergency contact, and baseline vitals</span>
                </div>
              </div>

              {/* Patient Fields Panel */}
              <div
                className="rounded-3xl p-6 border transition-all duration-300"
                style={{
                  background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                  borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                  boxShadow: theme === "dark" ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(15,23,42,0.02)",
                }}
              >
                <div className="flex items-center gap-3 border-b pb-4 mb-5" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                  <User className="text-[#008060] dark:text-emerald-400" size={20} />
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Patient Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Full name</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: "92%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">92% confidence</span>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Date of birth</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: "97%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">97% confidence</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {/* MRN */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Medical Record Number (MRN)</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={mrn}
                      onChange={(e) => setMrn(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: "88%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">88% confidence</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Gender / pronouns</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={genderPronouns}
                      onChange={(e) => setGenderPronouns(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: "94%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">94% confidence</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>National ID / passport number</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-amber-500 h-full" style={{ width: "84%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">84% confidence</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Emergency contact name & phone</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-amber-500 h-full" style={{ width: "82%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">82% confidence</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Preferred language</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: "93%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">93% confidence</span>
                  </div>

                  {/* Allergies */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Allergies</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: "95%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">95% confidence</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Chief complaint</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Onset / duration of symptoms</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={symptomDuration}
                      onChange={(e) => setSymptomDuration(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Current vitals</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={currentVitals}
                      onChange={(e) => setCurrentVitals(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-amber-500 h-full" style={{ width: "80%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">80% confidence</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Pain scale (1-10)</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                    </label>
                    <input
                      value={painScale}
                      onChange={(e) => setPainScale(e.target.value)}
                      className="h-10 px-3 border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 transition-colors"
                      style={{
                        borderColor: theme === "dark" ? "#475569" : "#CBD5E1",
                        background: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                      }}
                    />
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: "90%" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">90% confidence</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between mt-8 w-full">
              <Button
                onClick={() => goTo(1)}
                variant="outline"
                className="h-11 px-6 rounded-xl font-semibold border text-slate-500 dark:text-slate-400 cursor-pointer w-full sm:w-auto"
              >
                ← Back
              </Button>
              <Button
                onClick={() => goTo(3)}
                className="h-11 px-6 rounded-xl font-semibold bg-[#008060] hover:bg-[#00664d] text-[#E6F2EF] border-0 cursor-pointer flex items-center justify-center w-full sm:w-auto"
              >
                Continue to validate →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: INTERACTIVE VALIDATION (AUTOCOMPLETE / LASA / ERROR CORRECTION) */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between w-full animate-in fade-in duration-200">
            <div
              className="rounded-3xl p-6 md:p-8 border transition-all duration-300"
              style={{
                background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                boxShadow: theme === "dark" ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(15,23,42,0.02)",
              }}
            >
              <div className="flex items-center gap-3 border-b pb-4 mb-6" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                <Activity className="text-[#008060] dark:text-emerald-400" size={20} />
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Diagnosis & Medication Validation</h2>
              </div>

              {/* Field 1: Primary Diagnosis with LASA autocomplete */}
              <div className="mb-6 relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    Primary diagnosis / medication
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                  </label>
                  <Badge
                    className={`font-semibold shadow-none flex items-center gap-1 py-0.5 border ${
                      d1ok
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50"
                    }`}
                  >
                    {d1ok ? <Check size={11} /> : <AlertTriangle size={11} />}
                    {d1ok ? "Confirmed" : "Needs confirmation"}
                  </Badge>
                </div>

                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <input
                    value={primaryQuery}
                    onChange={(e) => handleAcInput(e.target.value)}
                    onKeyDown={handleAcKeyDown}
                    placeholder="Type to search or correct the OCR value..."
                    className={`h-11 w-full pl-4 pr-10 border rounded-xl text-sm font-semibold focus:outline-none transition-all ${
                      d1ok
                        ? "border-emerald-500 bg-emerald-50/10 focus:border-emerald-600"
                        : "border-amber-500 bg-amber-50/10 focus:border-amber-600"
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    {d1ok ? (
                      <Check className="text-emerald-500" size={16} />
                    ) : (
                      <Search className="text-amber-500" size={16} />
                    )}
                  </div>

                  {/* Autocomplete dropdown */}
                  {showDD && acResults.length > 0 && (
                    <div
                      className="absolute left-0 right-0 border rounded-xl mt-1.5 overflow-hidden z-20 shadow-xl"
                      style={{
                        background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                        borderColor: theme === "dark" ? "#475569" : "#E5E5E5",
                      }}
                    >
                      {/* Normal Matches */}
                      {acResults.filter((r) => !r.lasa).length > 0 && (
                        <div className="py-2 border-b last:border-b-0" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-1">
                            Matches
                          </div>
                          {acResults
                            .filter((r) => !r.lasa)
                            .map((item, idx) => {
                              const MatchIcon = CAT_IC[item.cat] || CAT_IC.default;
                              const isFoc = acFocused === acResults.indexOf(item);
                              return (
                                <div
                                  key={item.name}
                                  onClick={() => selectAcItem(item.name)}
                                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                                    isFoc
                                      ? "bg-slate-100 dark:bg-slate-800"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                  }`}
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{
                                      background: CAT_BG[item.cat] || CAT_BG.default,
                                      color: CAT_COL[item.cat] || CAT_COL.default,
                                    }}
                                  >
                                    <MatchIcon size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                      {hlMatch(item.name, primaryQuery)}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {item.cls} · {item.dose}
                                    </div>
                                  </div>
                                  <span
                                    className="text-xs font-semibold"
                                    style={{
                                      color:
                                        item.score > 0.8
                                          ? "#10B981"
                                          : item.score > 0.6
                                          ? "#F59E0B"
                                          : "#7E7E7E",
                                    }}
                                  >
                                    {Math.round(item.score * 100)}%
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {/* Look-alike / sound-alike matches */}
                      {acResults.filter((r) => r.lasa).length > 0 && (
                        <div className="py-2 border-b last:border-b-0" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-4 py-1 flex items-center gap-1">
                            <AlertTriangle size={11} /> Look-alike / sound-alike
                          </div>
                          {acResults
                            .filter((r) => r.lasa)
                            .map((item) => {
                              const MatchIcon = CAT_IC[item.cat] || CAT_IC.default;
                              const isFoc = acFocused === acResults.indexOf(item);
                              return (
                                <div
                                  key={item.name}
                                  onClick={() => selectAcItem(item.name)}
                                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                                    isFoc
                                      ? "bg-amber-50 dark:bg-amber-950/20"
                                      : "bg-amber-50/40 dark:bg-amber-950/5 hover:bg-amber-50 dark:hover:bg-amber-950/25"
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                    <MatchIcon size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                      {hlMatch(item.name, primaryQuery)}
                                      <span className="inline-flex items-center text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold px-1 py-0.5 rounded-md">
                                        LASA
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {item.cls} · {item.dose}
                                    </div>
                                  </div>
                                  <span className="text-xs font-semibold text-amber-500">
                                    {Math.round(item.score * 100)}%
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm selections Pill overlay */}
                {acSelected && (
                  <div className="mt-3 flex">
                    <span className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                      <CheckCircle size={13} className="text-emerald-500" />
                      {acSelected.name} · {acSelected.dose}
                      <X
                        size={14}
                        className="cursor-pointer text-emerald-600 hover:text-emerald-800 ml-1"
                        onClick={clearAc}
                      />
                    </span>
                  </div>
                )}

                {/* LASA Warning Box & verification card */}
                {acLasaPending && (
                  <div className="border border-amber-500 rounded-2xl bg-amber-50/20 dark:bg-amber-950/10 p-4 mt-4 animate-in slide-in-from-top duration-250">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3">
                      <AlertTriangle size={15} />
                      <span>These names are dangerously similar — select the correct one:</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Selection A */}
                      <div
                        onClick={() => handlePickLasa(acLasaPending.name)}
                        className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
                      >
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {acLasaPending.name}
                        </div>
                        <div className="text-xs text-slate-400 mb-2">
                          {acLasaPending.cls}
                        </div>
                        <div className="text-xs font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded-md flex gap-0.5">
                          {diffHl(
                            DB.find((d) => d.name === acLasaPending.lasa)?.name || "",
                            acLasaPending.name
                          )}
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold py-0 text-[10px] mt-2 border-transparent">
                          My Selection
                        </Badge>
                      </div>

                      {/* Selection B (Look alike drug) */}
                      <div
                        onClick={() => handlePickLasa(acLasaPending.lasa)}
                        className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
                      >
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {acLasaPending.lasa}
                        </div>
                        <div className="text-xs text-slate-400 mb-2">
                          {DB.find((d) => d.name === acLasaPending.lasa)?.cls}
                        </div>
                        <div className="text-xs font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded-md flex gap-0.5">
                          {diffHl(
                            acLasaPending.name,
                            acLasaPending.lasa
                          )}
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold py-0 text-[10px] mt-2 border-transparent">
                          Switch to this
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1">
                      <Info size={12} />
                      <span>Underlined red characters highlight where names differ. Verify with prescriber.</span>
                    </p>
                  </div>
                )}

                {/* Default status info banner */}
                {!acSelected && !acLasaPending && (
                  <div
                    className="status-note text-xs flex items-center gap-2 p-3 rounded-xl mt-3 border"
                    style={{
                      background: theme === "dark" ? "#1C1C1C" : "rgba(241, 245, 249, 0.4)",
                      borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                      color: theme === "dark" ? "#7E7E7E" : "#7E7E7E",
                    }}
                  >
                    <AlertTriangle size={15} className="text-amber-500" />
                    <span>OCR value needs verification — search and select the correct diagnosis</span>
                  </div>
                )}
              </div>

              {/* Field 2: Secondary Diagnosis with Suggestion apply */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    Secondary diagnosis
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-400">OCR</span>
                  </label>
                  <Badge
                    className={`font-semibold shadow-none flex items-center gap-1 py-0.5 border ${
                      d2ok
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50"
                        : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200/50"
                    }`}
                  >
                    {d2ok ? <Check size={11} /> : <X size={11} />}
                    {d2ok ? "Corrected" : "OCR error"}
                  </Badge>
                </div>

                <input
                  value={secondaryInput}
                  onChange={(e) => {
                    setSecondaryInput(e.target.value);
                    if (e.target.value.toLowerCase() === "hypertension") {
                      setD2ok(true);
                    } else {
                      setD2ok(false);
                    }
                  }}
                  className={`h-11 w-full px-4 border rounded-xl text-sm font-semibold focus:outline-none transition-colors ${
                    d2ok
                      ? "border-emerald-500 bg-emerald-50/10 focus:border-emerald-600"
                      : "border-red-500 bg-red-50/10 focus:border-red-600"
                  }`}
                />

                {!d2ok && (
                  <div className="mt-2.5">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mb-1.5">
                      <div className="bg-red-500 h-full" style={{ width: "44%" }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                        44% confidence — likely misread
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">Suggestion:</span>
                        <Button
                          onClick={applySecondaryCorrection}
                          size="sm"
                          className="h-7 px-3 text-xs bg-[#0A2540] text-emerald-50 border-0 hover:bg-emerald-700 cursor-pointer"
                        >
                          Apply "Hypertension" ✓
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Field 3: Prescribing physician */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  Prescribing physician
                </label>
                <input
                  value={physician}
                  onChange={(e) => setPhysician(e.target.value)}
                  className="h-11 w-full px-4 border rounded-xl text-sm font-semibold focus:outline-none border-emerald-500 bg-emerald-50/10 focus:border-emerald-600"
                />
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full" style={{ width: "96%" }} />
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">96% confidence</span>
              </div>
            </div>

            {/* Bottom validating actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center mt-8 w-full">
              <Button
                onClick={() => goTo(2)}
                variant="outline"
                className="h-11 px-6 rounded-xl font-semibold border text-slate-500 dark:text-slate-400 cursor-pointer w-full sm:w-auto"
              >
                ← Back
              </Button>

              {d1ok && d2ok ? (
                <Button
                  onClick={() => goTo(4)}
                  className="h-11 px-6 rounded-xl font-semibold bg-[#008060] hover:bg-[#00664d] text-[#E6F2EF] border-0 cursor-pointer flex items-center justify-center w-full sm:w-auto"
                >
                  Continue to confirm →
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold py-2">
                  <Lock size={15} />
                  <span>Resolve both fields to continue</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM перед сохранением */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-between w-full animate-in fade-in duration-200">
            <div
              className="rounded-3xl p-6 md:p-8 border transition-all duration-300"
              style={{
                background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                boxShadow: theme === "dark" ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(15,23,42,0.02)",
              }}
            >
              <div className="flex items-center gap-3 border-b pb-4 mb-6" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                <Check className="text-emerald-500" size={20} />
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Review & Confirm Before Saving</h2>
              </div>

              {/* Patient header card summary */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                <div className="w-12 h-12 rounded-full bg-[#0A2540] text-white font-bold flex items-center justify-center text-sm">
                  AA
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{patientName}</h3>
                  <p className="text-xs text-slate-400">MRN: {mrn} · DOB: {dob}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold uppercase text-[10px] tracking-wider py-0.5 border-transparent">
                  Verified
                </Badge>
              </div>

              {/* Review summary grid rows */}
              <div className="divide-y text-sm" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Primary diagnosis</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{acSelected ? `${acSelected.name} · ${acSelected.dose}` : "—"}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold border-transparent py-0 h-5">
                    Confirmed
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Secondary diagnosis</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{secondaryInput}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold border-transparent py-0 h-5">
                    Corrected
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Gender / pronouns</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{genderPronouns}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">National ID / passport</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{nationalId}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Emergency contact</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{emergencyContact}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Preferred language</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{preferredLanguage}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Allergies</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{allergies}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Prescribing physician</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{physician}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold border-transparent py-0 h-5">
                    Confirmed
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Chief complaint</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{chiefComplaint}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Onset / duration</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{symptomDuration}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Current vitals</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{currentVitals}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Pain scale</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">{painScale}</span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-transparent py-0 h-5">
                    OCR
                  </Badge>
                </div>

                <div className="py-3 flex justify-between gap-3">
                  <span className="text-slate-400 font-semibold w-1/3">Entered by</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex-1">Nursing Staff — Ward 4B</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Now</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between mt-8 w-full">
              <Button
                onClick={() => goTo(3)}
                variant="outline"
                className="h-11 px-6 rounded-xl font-semibold border text-slate-500 dark:text-slate-400 cursor-pointer w-full sm:w-auto"
              >
                ← Back
              </Button>
              <Button
                onClick={handleSave}
                className="h-11 px-6 rounded-xl font-semibold bg-[#0A2540] hover:bg-emerald-700 text-emerald-50 border-0 cursor-pointer flex items-center justify-center w-full sm:w-auto"
              >
                <Save size={15} className="mr-2" />
                Save to Patient Record
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS PANEL */}
        {step === 5 && (
          <div className="flex-1 flex items-center justify-center animate-in zoom-in-95 duration-200">
            <div
              className="rounded-3xl p-8 md:p-12 border text-center max-w-md w-full transition-all duration-300"
              style={{
                background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                boxShadow: theme === "dark" ? "0 10px 40px rgba(0,0,0,0.4)" : "0 10px 40px rgba(15,23,42,0.03)",
              }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-1 text-slate-800 dark:text-slate-100">Record Saved Successfully</h2>
              <p className="text-xs text-slate-400 mb-6">
                {patientName} · MRN: {mrn}
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={resetAll}
                  className="h-10 px-5 rounded-xl font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                >
                  Enter Next Patient
                </Button>
                <Button
                  onClick={() => navigate("/history")}
                  className="h-10 px-5 rounded-xl font-semibold bg-[#008060] hover:bg-[#00664d] text-[#E6F2EF] border-0 cursor-pointer text-xs"
                >
                  View Patient Record ↗
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
