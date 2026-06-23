import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Navbar } from "../components/navbar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Check,
  Pencil,
  Trash2,
  Receipt,
  CreditCard,
  Save,
} from "lucide-react";



const fieldSections = [
  {
    title: "Bill & Vendor Details",
    icon: Receipt,
    fields: [
      { key: "merchantName", label: "Merchant name" },
      { key: "transactionDate", label: "Transaction date" },
      { key: "invoiceNumber", label: "Invoice / Bill Number" },
      { key: "category", label: "Expense category" },
      { key: "paymentMethod", label: "Payment method" },
      { key: "taxId", label: "Merchant Tax ID / VAT" },
      { key: "notes", label: "Notes / Memo" },
    ],
  },
  {
    title: "Line Items & Amounts",
    icon: CreditCard,
    fields: [
      { key: "itemsList", label: "Purchased items list" },
      { key: "subtotal", label: "Subtotal" },
      { key: "taxAmount", label: "Tax / VAT" },
      { key: "totalAmount", label: "Total Amount" },
      { key: "discount", label: "Discount applied" },
      { key: "cardEnding", label: "Card ending" },
    ],
  },
] as const;

const apiUrl = (import.meta.env as any).VITE_API_URL || "https://finocr.onrender.com";

export function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const { token, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const [record, setRecord] = useState<any>({
    merchantName: "Loading...",
    transactionDate: "",
    invoiceNumber: "",
    category: "",
    paymentMethod: "",
    taxId: "",
    notes: "",
    itemsList: "",
    subtotal: "",
    taxAmount: "",
    totalAmount: "",
    discount: "",
    cardEnding: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Individual field action states
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [deletedFields, setDeletedFields] = useState<Record<string, boolean>>({});
  const [correctedFields, setCorrectedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRecord = async () => {
      if (!token || !id) return;
      try {
        const res = await fetch(`${apiUrl}/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const exp = await res.json();
          setRecord({
            merchantName: exp.merchant_name || "",
            transactionDate: exp.transaction_date || "",
            invoiceNumber: exp.invoice_number || "",
            category: exp.category || "",
            paymentMethod: exp.payment_method || "",
            taxId: exp.tax_id || "",
            notes: exp.notes || "",
            itemsList: exp.items_list || "",
            subtotal: exp.subtotal || "",
            taxAmount: exp.tax_amount || "",
            totalAmount: exp.total_amount || "",
            discount: exp.discount || "",
            cardEnding: exp.card_ending || "",
          });
        }
      } catch (error) {
        console.error("Error fetching record:", error);
      }
    };
    fetchRecord();
  }, [id, token]);

  const handleFieldChange = (key: string, value: string) => {
    setRecord((prev: any) => ({
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
        next ? "Edit mode enabled for this expense record" : "Record changes saved"
      );
      return next;
    });
  };

  const handleCopyAll = () => {
    const textToCopy = [
      `Merchant Name: ${record.merchantName}`,
      `Transaction Date: ${record.transactionDate}`,
      `Invoice Number: ${record.invoiceNumber}`,
      `Category: ${record.category}`,
      `Payment Method: ${record.paymentMethod}`,
      `Tax ID: ${record.taxId}`,
      `Notes: ${record.notes}`,
      `Items: ${record.itemsList}`,
      `Subtotal: ${record.subtotal}`,
      `Tax: ${record.taxAmount}`,
      `Total: ${record.totalAmount}`,
      `Discount: ${record.discount}`,
      `Card Ending: ${record.cardEnding}`,
    ].join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    toast.success("Copied OCR expense details");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDeleteRecord = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.warning(`Deleted OCR expense record ${record.invoiceNumber}`);
        navigate("/history");
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      console.error("Delete record error:", error);
      toast.error("Failed to delete record due to network error");
    }
  };

  const handleCopyField = (key: string, label: string) => {
    const value = record[key] || "";
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

  const handleSaveToDatabase = async () => {
    toast.promise(
      (async () => {
        const res = await fetch(`${apiUrl}/api/expenses/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            merchant_name: record.merchantName,
            transaction_date: record.transactionDate,
            invoice_number: record.invoiceNumber,
            category: record.category,
            payment_method: record.paymentMethod,
            tax_id: record.taxId,
            notes: record.notes,
            items_list: record.itemsList,
            subtotal: record.subtotal,
            tax_amount: record.taxAmount,
            total_amount: record.totalAmount,
            discount: record.discount,
            card_ending: record.cardEnding,
          })
        });
        if (!res.ok) {
          throw new Error("Failed to save changes");
        }
      })(),
      {
        loading: "Saving expense transaction...",
        success: "Expense successfully saved to database!",
        error: "Failed to save record.",
      }
    );
  };

  return (
    <div className="flex min-h-screen transition-colors duration-300 flex-col bg-transparent">
      <Navbar />

      <div className="flex-1 px-4 pb-6 md:p-8 pt-24 md:pt-28 min-w-0 max-w-7xl mx-auto w-full">
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
            Back to Expense History
          </Button>
        </div>

        <div
          className="rounded-3xl p-6 md:p-8 border mb-6 transition-all duration-300 glass-panel"
          style={{
            borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b"
            style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                {record.merchantName ? record.merchantName.slice(0, 2).toUpperCase() : "TX"}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {record.merchantName}
                </h1>
                <p className="text-sm text-slate-400">
                  Transaction #{id} · Invoice #: {record.invoiceNumber} · Date: {record.transactionDate} · Category: {record.category}
                </p>
              </div>
            </div>

            <Badge className="self-start lg:self-center bg-[#10B981] text-emerald-50 font-semibold uppercase text-[10px] tracking-wider py-1 px-2.5 border-transparent">
              Verified Expense Record
            </Badge>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
              OCR Extracted Receipt Text
            </h2>
            <div className="rounded-2xl p-4 font-mono text-xs leading-relaxed border text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50"
            style={{
              borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
            }}
            >
              Merchant: {record.merchantName}  Date: {record.transactionDate}  Invoice: {record.invoiceNumber}<br />
              Category: {record.category}  Payment: {record.paymentMethod}  Tax ID: {record.taxId}<br />
              Notes: {record.notes}<br />
              Items: {record.itemsList?.replace(/\n/g, ", ")}<br />
              Subtotal: {record.subtotal}  Tax: {record.taxAmount}  Total: {record.totalAmount}
            </div>
          </div>
        </div>

        <div className="space-y-6 pb-6">
          {fieldSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-3xl p-6 border transition-all duration-300 glass-panel"
                style={{
                  borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
                }}
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4 mb-5 sticky top-0 z-10 bg-transparent"
                  style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon className="text-[#10B981] dark:text-emerald-400" size={20} />
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      {section.title}
                    </h2>
                  </div>
                  {section.title === "Bill & Vendor Details" && (
                    <div className="flex flex-wrap gap-2 items-center bg-transparent">
                      <Button
                        onClick={handleCopyAll}
                        variant="outline"
                        className="h-10 px-4 rounded-xl text-xs font-medium cursor-pointer glass-button border border-slate-300 dark:border-slate-700"
                        style={{ color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }}
                        disabled={isEditing}
                      >
                        {copiedAll ? <Check size={14} className="mr-1.5 text-emerald-500" /> : <Copy size={14} className="mr-1.5" />}
                        {copiedAll ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        onClick={handleToggleEdit}
                        variant="outline"
                        className={isEditing ? "h-10 px-4 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white border-0" : "h-10 px-4 rounded-xl text-xs font-medium cursor-pointer glass-button border border-slate-300 dark:border-slate-700"}
                        style={isEditing ? {} : { color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }}
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
                        className="h-10 px-4 rounded-xl text-xs font-medium bg-[#10B981] hover:bg-[#059669] text-white cursor-pointer shadow-sm transition-colors duration-200 border-0"
                        disabled={isEditing}
                      >
                        <Save size={14} className="mr-1.5" />
                        Save to Database
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                : "bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500"
                            }`}
                          >
                            {correctedFields[field.key] ? "Corrected" : "OCR"}
                          </span>
                        </label>
                        <div className="flex items-start gap-1.5 mt-1 w-full">
                          {field.key === "itemsList" ? (
                            <textarea
                              id={`input-${field.key}`}
                              value={record[field.key] || ""}
                              onChange={(e) => handleFieldChange(field.key, e.target.value)}
                              readOnly={!isEditing && !editingFields[field.key]}
                              rows={3}
                              className={`flex-1 min-h-[80px] p-3 border rounded-xl text-sm font-semibold transition-all duration-200 glass-input ${
                                isEditing || editingFields[field.key]
                                  ? "focus:outline-none focus:border-[#10B981] border-[#10B981] dark:border-[#10B981] shadow-sm"
                                  : "cursor-default select-none opacity-90 resize-none border-transparent"
                              }`}
                              style={{
                                color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                              }}
                            />
                          ) : (
                            <input
                              id={`input-${field.key}`}
                              value={record[field.key] || ""}
                              onChange={(e) => handleFieldChange(field.key, e.target.value)}
                              readOnly={!isEditing && !editingFields[field.key]}
                              className={`flex-1 h-10 px-3 border rounded-xl text-sm font-semibold transition-all duration-200 glass-input ${
                                isEditing || editingFields[field.key]
                                  ? "focus:outline-none focus:border-[#10B981] border-[#10B981] dark:border-[#10B981] shadow-sm"
                                  : "cursor-default select-none opacity-90 border-transparent"
                              }`}
                              style={{
                                color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                              }}
                            />
                          )}
                          
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
                    style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
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
                           <span className="text-[#10B981] font-bold text-sm leading-none">+</span>
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
