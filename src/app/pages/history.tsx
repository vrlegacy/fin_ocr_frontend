import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useTheme } from "../context/ThemeContext";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";
import { useIsMobile } from "../components/ui/use-mobile";
import { toast } from "sonner";
import { Search, User, Calendar, Eye, Trash2, ShieldAlert, Hash } from "lucide-react";

interface HistoryRecord {
  id: number;
  patientName: string;
  testId: string;
  testName: string;
  genderPronouns: string;
  preferredLanguage: string;
  chiefComplaint: string;
  primaryDiagnosis: string;
  secondaryDiagnosis: string;
  enteredBy: string;
  uploadedAt: string;
  status: "Verified" | "Needs Review";
}

const demoRecords: HistoryRecord[] = [
  {
    id: 1,
    patientName: "Ahmed Al Rashidi",
    testId: "T-8921",
    testName: "Complete Blood Count (CBC)",
    genderPronouns: "Male (he/him)",
    preferredLanguage: "Arabic",
    chiefComplaint: "Severe itching and dizziness",
    primaryDiagnosis: "Hydroxyzine 25mg",
    secondaryDiagnosis: "Hypertension",
    enteredBy: "Nurse Aisha Khan",
    uploadedAt: "04 Jun 2026",
    status: "Verified",
  },
  {
    id: 2,
    patientName: "Leena Farooq",
    testId: "T-4432",
    testName: "Basic Metabolic Panel (BMP)",
    genderPronouns: "Female (she/her)",
    preferredLanguage: "English",
    chiefComplaint: "Headache with blurred vision",
    primaryDiagnosis: "Amlodipine 5mg",
    secondaryDiagnosis: "Migraine",
    enteredBy: "Nurse Aisha Khan",
    uploadedAt: "03 Jun 2026",
    status: "Verified",
  },
  {
    id: 3,
    patientName: "Omar Nasser",
    testId: "T-1029",
    testName: "Urinalysis",
    genderPronouns: "Male (he/him)",
    preferredLanguage: "Arabic",
    chiefComplaint: "Fever and productive cough",
    primaryDiagnosis: "Amoxicillin 500mg",
    secondaryDiagnosis: "Upper respiratory infection",
    enteredBy: "Nurse Aisha Khan",
    uploadedAt: "02 Jun 2026",
    status: "Needs Review",
  },
  {
    id: 4,
    patientName: "Sara Ibrahim",
    testId: "T-5573",
    testName: "Lipid Panel",
    genderPronouns: "Female (she/her)",
    preferredLanguage: "Hindi",
    chiefComplaint: "Lower back pain after fall",
    primaryDiagnosis: "Pain management review",
    secondaryDiagnosis: "Muscle strain",
    enteredBy: "Nurse Aisha Khan",
    uploadedAt: "01 Jun 2026",
    status: "Verified",
  },
];

export function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState(demoRecords);
  const { theme } = useTheme();
  const { isCollapsed } = useSidebarCollapsed();
  const isMobile = useIsMobile();

  const filteredRecords = records.filter((record) =>
    [
      record.patientName,
      record.testId,
      record.testName,
      record.preferredLanguage,
      record.chiefComplaint,
      record.primaryDiagnosis,
      record.secondaryDiagnosis,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleDeleteRecord = (id: number, patientName: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
    toast.warning(`Removed ${patientName} from OCR history`);
  };

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
            OCR History
          </h1>
          <p
            className="transition-colors"
            style={{
              fontSize: "14px",
              color: theme === "dark" ? "#7E7E7E" : "#7E7E7E",
            }}
          >
            Review patient intake records processed through the OCR entry workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div
            className="md:col-span-2 lg:col-span-2 rounded-2xl p-4 border transition-all duration-300"
            style={{
              background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
              borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
              boxShadow:
                theme === "dark"
                  ? "0 4px 20px -2px rgba(0, 0, 0, 0.3)"
                  : "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme === "dark" ? "#7E7E7E" : "#7E7E7E" }}
              />
              <Input
                type="text"
                placeholder="Search by patient, test ID, test name, or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-0 rounded-xl focus-visible:ring-1"
                style={{
                  background: theme === "dark" ? "#1C1C1C" : "#F5F5F5",
                  fontSize: "14px",
                  color: theme === "dark" ? "#F1F5F9" : "#1C1C1C",
                }}
              />
            </div>
          </div>

          <div
            className="rounded-2xl p-4 flex items-center gap-3 border transition-all duration-300"
            style={{
              background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
              borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
              boxShadow:
                theme === "dark"
                  ? "0 4px 20px -2px rgba(0, 0, 0, 0.3)"
                  : "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border"
              style={{
                background: theme === "dark" ? "#1C1C1C" : "#F5F5F5",
                color: theme === "dark" ? "#7E7E7E" : "#7E7E7E",
                borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
              }}
            >
              <User size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: theme === "dark" ? "#F1F5F9" : "#1C1C1C",
                }}
              >
                {records.length}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: theme === "dark" ? "#7E7E7E" : "#7E7E7E",
                  fontWeight: "500",
                }}
              >
                Patient Records
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 flex items-center gap-3 border transition-all duration-300"
            style={{
              background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
              borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
              boxShadow:
                theme === "dark"
                  ? "0 4px 20px -2px rgba(0, 0, 0, 0.3)"
                  : "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border"
              style={{
                background: theme === "dark" ? "#1C1C1C" : "#F5F5F5",
                color: "#FFC700",
                borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: theme === "dark" ? "#F1F5F9" : "#1C1C1C",
                }}
              >
                {records.filter((record) => record.status === "Needs Review").length}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: theme === "dark" ? "#7E7E7E" : "#7E7E7E",
                  fontWeight: "500",
                }}
              >
                Needs Review
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-3xl p-4 md:p-6 border transition-all duration-300 overflow-hidden"
          style={{
            background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
            borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
            boxShadow:
              theme === "dark"
                ? "0 10px 30px rgba(0, 0, 0, 0.3)"
                : "0 10px 30px rgba(15, 23, 42, 0.03)",
          }}
        >
          <h2
            className="mb-5 tracking-tight transition-colors"
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: theme === "dark" ? "#F1F5F9" : "#1C1C1C",
            }}
          >
            OCR Records ({filteredRecords.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr style={{ borderBottom: theme === "dark" ? "1px solid #3A3A3A" : "1px solid #E5E5E5" }}>
                  {["ID", "Patient", "Test ID", "Test Name", "Entered By", "Chief Complaint", "Primary Diagnosis", "Intake Date", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className="text-left pb-4 px-4"
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: theme === "dark" ? "#7E7E7E" : "#7E7E7E",
                        textTransform: "uppercase",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <Hash size={13} />
                        <span>{record.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="min-w-[180px]">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {record.patientName}
                        </div>
                        <div className="text-xs text-slate-400">{record.genderPronouns}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[100px]">
                        {record.testId}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-semibold text-[#0A2540] dark:text-slate-200 min-w-[180px]">
                        {record.testName}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400 min-w-[150px]">
                        {record.enteredBy}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-slate-700 dark:text-slate-300 min-w-[220px]">
                        {record.chiefComplaint}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-slate-700 dark:text-slate-300 min-w-[180px]">
                        {record.primaryDiagnosis}
                      </div>
                      <div className="text-xs text-slate-400">
                        Secondary: {record.secondaryDiagnosis}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 min-w-[120px]">
                        <Calendar size={14} />
                        <span>{record.uploadedAt}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => navigate(`/result/${record.id}`)}
                          variant="outline"
                          className="h-9 px-3 rounded-xl flex items-center gap-2 shadow-none cursor-pointer hover:bg-[#0A2540] hover:text-white dark:hover:bg-[#0A2540]"
                          style={{
                            borderColor: theme === "dark" ? "#3A3A3A" : "#0A2540",
                            color: theme === "dark" ? "#F1F5F9" : "#0A2540",
                          }}
                        >
                          <Eye size={14} />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDeleteRecord(record.id, record.patientName)}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                          title="Delete record"
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

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                No OCR history matched "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
