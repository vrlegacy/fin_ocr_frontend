import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useTheme } from "../context/ThemeContext";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";
import { useIsMobile } from "../components/ui/use-mobile";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Check,
  Pencil,
  Trash2,
  User,
  Activity,
  Save,
} from "lucide-react";

const initialRecord = {
  patientName: "Ahmed Al Rashidi",
  dob: "12/04/1985",
  mrn: "AUH-2024-0291",
  intakeDate: "04 Jun 2026",
  enteredBy: "Nurse Aisha Khan",
  genderPronouns: "Male (he/him)",
  nationalId: "784-1985-1234567-1",
  emergencyContact: "Fatima Al Rashidi - +971 50 123 4567",
  preferredLanguage: "Arabic",
  allergies: "Penicillin",
  physician: "Dr. Sarah Al Mansoori",
  chiefComplaint: "Severe itching and dizziness",
  symptomDuration: "Started 3 days ago",
  currentVitals: "BP 148/92 mmHg, HR 88 bpm, Temp 37.4 C, Weight 82 kg",
  painScale: "6/10",
  primaryDiagnosis: "Hydroxyzine 25mg",
  secondaryDiagnosis: "Hypertension",
};

const fieldSections = [
  {
    title: "Patient Information",
    icon: User,
    fields: [
      { key: "patientName", label: "Full name" },
      { key: "dob", label: "Date of birth" },
      { key: "mrn", label: "Medical Record Number (MRN)" },
      { key: "genderPronouns", label: "Gender / pronouns" },
      { key: "nationalId", label: "National ID / passport number" },
      { key: "emergencyContact", label: "Emergency contact name & phone" },
      { key: "preferredLanguage", label: "Preferred language" },
      { key: "allergies", label: "Allergies" },
    ],
  },
  {
    title: "Clinical Context & Vitals",
    icon: Activity,
    fields: [
      { key: "chiefComplaint", label: "Chief complaint" },
      { key: "symptomDuration", label: "Onset / duration of symptoms" },
      { key: "currentVitals", label: "Current vitals" },
      { key: "painScale", label: "Pain scale (1-10)" },
      { key: "primaryDiagnosis", label: "Primary diagnosis / medication" },
      { key: "secondaryDiagnosis", label: "Secondary diagnosis" },
      { key: "physician", label: "Prescribing physician" },
    ],
  },
] as const;

type RecordKey = keyof typeof initialRecord;

export function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const { isCollapsed } = useSidebarCollapsed();
  const isMobile = useIsMobile();
  const [record, setRecord] = useState(initialRecord);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Individual field action states
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [deletedFields, setDeletedFields] = useState<Record<string, boolean>>({});
  const [correctedFields, setCorrectedFields] = useState<Record<string, boolean>>({
    secondaryDiagnosis: true,
  });

  const handleFieldChange = (key: RecordKey, value: string) => {
    setRecord((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCorrectedFields((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const handleToggleEdit = () => {
    setIsEditing((prev) => {
      const next = !prev;
      toast[next ? "info" : "success"](
        next ? "Edit mode enabled for this OCR record" : "Record changes saved"
      );
      return next;
    });
  };

  const handleCopyAll = () => {
    const textToCopy = [
      `Patient Name: ${record.patientName}`,
      `Date of Birth: ${record.dob}`,
      `MRN: ${record.mrn}`,
      `Date of Intake: ${record.intakeDate}`,
      `Entered By: ${record.enteredBy}`,
      `Gender / Pronouns: ${record.genderPronouns}`,
      `National ID / Passport Number: ${record.nationalId}`,
      `Emergency Contact Name & Phone: ${record.emergencyContact}`,
      `Preferred Language: ${record.preferredLanguage}`,
      `Allergies: ${record.allergies}`,
      `Chief Complaint: ${record.chiefComplaint}`,
      `Onset / Duration of Symptoms: ${record.symptomDuration}`,
      `Current Vitals: ${record.currentVitals}`,
      `Pain Scale (1-10): ${record.painScale}`,
      `Primary Diagnosis: ${record.primaryDiagnosis}`,
      `Secondary Diagnosis: ${record.secondaryDiagnosis}`,
      `Prescribing Physician: ${record.physician}`,
    ].join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    toast.success("Copied OCR record details");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDeleteRecord = () => {
    toast.warning(`Deleted OCR record ${record.mrn}`);
    navigate("/history");
  };

  const handleCopyField = (key: string, label: string) => {
    const value = record[key as RecordKey] || "";
    navigator.clipboard.writeText(value);
    setCopiedFields((prev) => ({ ...prev, [key]: true }));
    toast.success(`Copied ${label}`);
    setTimeout(() => {
      setCopiedFields((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleToggleFieldEdit = (key: string, label: string) => {
    setEditingFields((prev) => {
      const isEditingNow = !prev[key];
      if (isEditingNow) {
        setTimeout(() => {
          const el = document.getElementById(`input-${key}`) as HTMLInputElement;
          if (el) {
            el.focus();
            el.select();
          }
        }, 50);
      } else {
        toast.success(`Saved ${label}`);
      }
      return { ...prev, [key]: isEditingNow };
    });
  };

  const handleDeleteField = (key: string, label: string) => {
    setDeletedFields((prev) => ({ ...prev, [key]: true }));
    toast.success(`Deleted ${label}`, {
      action: {
        label: "Undo",
        onClick: () => {
          setDeletedFields((prev) => ({ ...prev, [key]: false }));
        },
      },
    });
  };

  const handleSaveToDatabase = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Saving record to database...",
        success: "Record successfully saved to database!",
        error: "Failed to save record.",
      }
    );
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

        <div className="mb-6">
          <Button
            onClick={() => {
              if (isEditing || Object.values(editingFields).some(Boolean)) {
                toast.warning("Finish editing before leaving.");
              } else {
                navigate("/history");
              }
            }}
            variant="ghost"
            className="px-0 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-transparent transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to History
          </Button>
        </div>

        <div
          className="rounded-3xl p-6 md:p-8 border mb-6 transition-all duration-300"
          style={{
            background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
            borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
            boxShadow:
              theme === "dark"
                ? "0 10px 30px rgba(0, 0, 0, 0.3)"
                : "0 10px 30px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b"
            style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0A2540] text-white font-bold flex items-center justify-center text-sm">
                AA
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {record.patientName}
                </h1>
                <p className="text-sm text-slate-400">
                  Record #{id} · MRN: {record.mrn} · Intake Date: {record.intakeDate} · Entered By: {record.enteredBy}
                </p>
              </div>
            </div>

            <Badge className="self-start lg:self-center bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold uppercase text-[10px] tracking-wider py-1 px-2.5 border-transparent">
              Verified OCR Record
            </Badge>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
              OCR Extracted Data / Raw Data
            </h2>
            <div className="rounded-2xl p-4 font-mono text-xs leading-relaxed border text-slate-500 dark:text-slate-400"
            style={{
              background: theme === "dark" ? "#1C1C1C" : "#F5F5F5",
              borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
            }}
            >
              Patient: {record.patientName}  DOB: {record.dob}  MRN: {record.mrn}<br />
              Intake Date: {record.intakeDate}  Entered By: {record.enteredBy}<br />
              Gender / Pronouns: {record.genderPronouns}  National ID: {record.nationalId}<br />
              Emergency Contact: {record.emergencyContact}<br />
              Preferred Language: {record.preferredLanguage}  Chief Complaint: {record.chiefComplaint}<br />
              Onset / Duration: {record.symptomDuration}  Current Vitals: {record.currentVitals}<br />
              Pain Scale: {record.painScale}  Diagnosis: {record.primaryDiagnosis}  Secondary: {record.secondaryDiagnosis}<br />
              Allergies: {record.allergies}  Physician: {record.physician}
            </div>
          </div>
        </div>

        <div className="space-y-6 pb-6">
          {fieldSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-3xl p-6 border transition-all duration-300"
                style={{
                  background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                  borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5",
                  boxShadow:
                    theme === "dark"
                      ? "0 10px 30px rgba(0,0,0,0.3)"
                      : "0 10px 30px rgba(15,23,42,0.02)",
                }}
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4 mb-5 sticky top-0 z-10 bg-white dark:bg-[#2A2A2A]"
                  style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon className="text-[#008060] dark:text-emerald-400" size={20} />
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      {section.title}
                    </h2>
                  </div>
                  {section.title === "Patient Information" && (
  <>
    {isEditing && (
      <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 p-4 rounded-md mb-4 flex items-center justify-between sticky top-0 z-20">
  <span className="font-medium">You are editing this record. Please save changes.</span>
</div>
    )}
    <div className="flex flex-wrap gap-2 items-center sticky top-0 z-10 bg-white dark:bg-[#2A2A2A]">
          
                      <Button
                        onClick={handleCopyAll}
                        variant="outline"
                        className="h-10 px-4 rounded-xl text-xs font-medium cursor-pointer"
                        disabled={isEditing}
                      >
                        {copiedAll ? <Check size={14} className="mr-1.5 text-emerald-500" /> : <Copy size={14} className="mr-1.5" />}
                        {copiedAll ? "Copied" : "Copy"}
                      </Button>
                      <Button
                          onClick={handleToggleEdit}
                          variant="outline"
                          className={isEditing ? "h-10 px-4 rounded-xl text-xs font-medium bg-red-600 hover:bg-green-600 text-white" : "h-10 px-4 rounded-xl text-xs font-medium cursor-pointer"}
                        >
                          {isEditing ? <Save size={14} className="mr-1.5" /> : <Pencil size={14} className="mr-1.5" />}
                          {isEditing ? "Save" : "Edit"}
                        </Button>
                      <Button
                        onClick={handleDeleteRecord}
                        variant="outline"
                        className="h-10 px-4 rounded-xl text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/20 cursor-pointer"
                        disabled={isEditing}
                      >
                        <Trash2 size={14} className="mr-1.5" />
                        Delete
                      </Button>
                      <Button
                        onClick={handleSaveToDatabase}
                        className="h-10 px-4 rounded-xl text-xs font-medium bg-[#008060] hover:bg-[#00664d] dark:bg-[#008060] dark:hover:bg-[#00664d] text-white cursor-pointer shadow-sm transition-colors duration-200"
                        disabled={isEditing}
                      >
                        <Save size={14} className="mr-1.5" />
                        Save to Database
                      </Button>
                    </div>
                  </>
                )}
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {section.fields
                    .filter((field) => !deletedFields[field.key])
                    .map((field) => (
                      <div key={field.key} className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>{field.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono transition-colors ${
                              correctedFields[field.key]
                                ? "bg-[#FFC700] text-[#1C1C1C] font-semibold"
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            }`}
                          >
                            {correctedFields[field.key] ? "Corrected" : "OCR"}
                          </span>
                        </label>
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            id={`input-${field.key}`}
                            value={record[field.key as RecordKey] || ""}
                            onChange={(e) => handleFieldChange(field.key as RecordKey, e.target.value)}
                            readOnly={!isEditing && !editingFields[field.key]}
                            className={`flex-1 h-10 px-3 border rounded-xl text-sm font-semibold transition-all duration-200 ${
                              isEditing || editingFields[field.key]
                                ? "focus:outline-none focus:border-[#008060] dark:focus:border-emerald-400 border-[#008060] dark:border-emerald-500 shadow-sm"
                                : "cursor-default select-none opacity-90"
                            }`}
                            style={{
                              borderColor: theme === "dark" ? "#64748B" : "#000000",
                              background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
                              color: theme === "dark" ? "#F1F5F9" : "#1C1C1C",
                            }}
                          />
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyField(field.key, field.label)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                              title={`Copy ${field.label}`}
                            >
                              {copiedFields[field.key] ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                            </button>

                            <button
                              onClick={() => handleToggleFieldEdit(field.key, field.label)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                editingFields[field.key]
                                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              }`}
                              title={editingFields[field.key] ? `Save ${field.label}` : `Edit ${field.label}`}
                            >
                              {editingFields[field.key] ? <Check size={15} /> : <Pencil size={15} />}
                            </button>

                            <button
                              onClick={() => handleDeleteField(field.key, field.label)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title={`Delete ${field.label}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Restore deleted fields section */}
                {section.fields.some((f) => deletedFields[f.key]) && (
                  <div
                    className="mt-6 pt-4 border-t flex flex-wrap gap-2 items-center"
                    style={{ borderColor: theme === "dark" ? "#3A3A3A" : "#E5E5E5" }}
                  >
                    <span className="text-xs font-bold text-slate-400">Hidden fields:</span>
                    {section.fields
                      .filter((f) => deletedFields[f.key])
                      .map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setDeletedFields((prev) => ({ ...prev, [f.key]: false }))}
                          className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                          title={`Restore ${f.label}`}
                        >
                          <span>{f.label}</span>
                          <span className="text-emerald-500 font-bold text-sm leading-none">+</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
