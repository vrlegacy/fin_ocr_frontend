import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/navbar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import {
  Upload,
  Camera,
  FileText,
  Check,
  CheckCircle,
  X,
  Plus,
  Save,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Receipt,
  CreditCard,
  Pencil,
} from "lucide-react";

const apiUrl = (import.meta.env as any).VITE_API_URL || "https://finocr.onrender.com";

export function OcrEntryPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { token, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Stepper workflow step: 1 (Ingestion Selectors), 2 (One-Step Review/Edit), 3 (Success)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Ingestion fields state
  const [merchantName, setMerchantName] = useState("Target Stores");
  const [transactionDate, setTransactionDate] = useState("18 Jun 2026");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-8849");
  const [category, setCategory] = useState("Office Supplies");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [taxId, setTaxId] = useState("US-7766554-1");
  const [notes, setNotes] = useState("Q2 Office supplies restocking run");

  // Amounts states
  const [itemsList, setItemsList] = useState("1x Wireless Keyboard (₹45.00)\n2x AA Battery Pack (₹15.00)\n1x USB-C Charger (₹25.00)");
  const [subtotal, setSubtotal] = useState("₹85.00");
  const [taxAmount, setTaxAmount] = useState("₹6.80");
  const [totalAmount, setTotalAmount] = useState("₹91.80");
  const [discount, setDiscount] = useState("₹0.00");
  const [cardEnding, setCardEnding] = useState("Visa *9981");

  // Dynamic custom fields list
  const [customFields, setCustomFields] = useState<{ id: string; key: string; value: string }[]>([]);

  // Audit alerts/corrections flags
  const [flaggedFields, setFlaggedFields] = useState<Record<string, boolean>>({
    category: true,
    taxAmount: true,
  });
  const [correctedFields, setCorrectedFields] = useState<Record<string, boolean>>({});

  // Ingestion upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(15);
    toast.loading("Analyzing purchase receipt via OCR...", { id: "ocr-toast" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(40);
      const res = await fetch(`${apiUrl}/api/ocr/scan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(80);
      if (!res.ok) {
        throw new Error("OCR Scanning failed");
      }

      const data = await res.json();
      setUploadProgress(100);

      // Populate extracted values
      setMerchantName(data.merchantName || "");
      setTransactionDate(data.transactionDate || "");
      setInvoiceNumber(data.invoiceNumber || "");
      setCategory(data.category || "");
      setPaymentMethod(data.paymentMethod || "");
      setTaxId(data.taxId || "");
      setNotes(data.notes || "Receipt uploaded");
      setItemsList(data.itemsList || "");
      const formatWithRupee = (val: string) => {
        if (!val) return "";
        return val.startsWith("₹") ? val : `₹${val}`;
      };

      setSubtotal(formatWithRupee(data.subtotal));
      setTaxAmount(formatWithRupee(data.taxAmount));
      setTotalAmount(formatWithRupee(data.totalAmount));
      setDiscount(formatWithRupee(data.discount));
      setCardEnding(data.cardEnding || "");

      // Reset custom fields
      setCustomFields([]);
      setCorrectedFields({});
      setFlaggedFields({
        category: !data.category,
        taxAmount: !data.taxAmount,
      });

      setStep(2);
      toast.success("Receipt scanned! Review details before saving.", { id: "ocr-toast" });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to parse receipt", { id: "ocr-toast" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleManualEntryInit = () => {
    setMerchantName("");
    setTransactionDate(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
    setInvoiceNumber("");
    setCategory("Others");
    setPaymentMethod("UPI");
    setTaxId("");
    setNotes("");
    setItemsList("");
    setSubtotal("₹0.00");
    setTaxAmount("₹0.00");
    setTotalAmount("₹0.00");
    setDiscount("₹0.00");
    setCardEnding("");
    setCorrectedFields({});
    setFlaggedFields({});
    setCustomFields([]);
    setStep(2);
  };

  const handleAddCustomField = () => {
    const newId = String(Date.now() + Math.random());
    setCustomFields((prev) => [...prev, { id: newId, key: "", value: "" }]);
  };

  const handleCustomFieldChange = (id: string, field: "key" | "value", value: string) => {
    setCustomFields((prev) =>
      prev.map((cf) => (cf.id === id ? { ...cf, [field]: value } : cf))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((cf) => cf.id !== id));
  };

  const handleSave = async () => {
    try {
      let finalNotes = notes;
      if (customFields.length > 0) {
        const customString = customFields
          .filter((cf) => cf.key.trim() !== "")
          .map((cf) => `${cf.key}: ${cf.value}`)
          .join("\n");
        if (customString) {
          finalNotes = finalNotes ? `${finalNotes}\n\nCustom Details:\n${customString}` : customString;
        }
      }

      const res = await fetch(`${apiUrl}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          merchant_name: merchantName,
          transaction_date: transactionDate,
          invoice_number: invoiceNumber,
          category: category,
          payment_method: paymentMethod,
          tax_id: taxId,
          notes: finalNotes,
          items_list: itemsList,
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          discount: discount,
          card_ending: cardEnding,
          status: "Verified",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to log expense record");
      }

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setStep(3);
      toast.success("Expense successfully logged to your dashboard!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to log expense record");
    }
  };

  const resetAll = () => {
    setStep(1);
    setMerchantName("Target Stores");
    setTransactionDate("18 Jun 2026");
    setInvoiceNumber("INV-2026-8849");
    setCategory("Office Supplies");
    setPaymentMethod("Credit Card");
    setTaxId("US-7766554-1");
    setNotes("Q2 Office supplies restocking run");
    setItemsList("1x Wireless Keyboard (₹45.00)\n2x AA Battery Pack (₹15.00)\n1x USB-C Charger (₹25.00)");
    setSubtotal("₹85.00");
    setTaxAmount("₹6.80");
    setTotalAmount("₹91.80");
    setDiscount("₹0.00");
    setCardEnding("Visa *9981");
    setFlaggedFields({
      category: true,
      taxAmount: true,
    });
    setCorrectedFields({});
    setCustomFields([]);
  };

  return (
    <div className="flex min-h-screen transition-colors duration-300 flex-col bg-transparent relative pb-16">
      <Navbar />

      <div className="flex-1 px-4 pb-6 md:p-8 pt-24 md:pt-28 w-full flex flex-col min-h-0 max-w-7xl mx-auto">
        {/* Navigation Header */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/dashboard")} className="cursor-pointer">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Scan Bill</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* STEP 1: SCAN OR MANUAL ENTRY SELECTOR (SIDE BY SIDE) */}
        {step === 1 && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-300">
            {/* Left Card: Details / Information */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-8 border flex flex-col justify-between relative bg-gradient-to-br from-white/70 to-white/40 min-h-[360px]">
              <div>
                <div className="flex items-center gap-3 border-b pb-4 mb-6" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
                  <Receipt className="text-[#10B981]" size={24} />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Finch AI Ingestion Hub</h2>
                </div>
                
                {!isUploading ? (
                  <div className="space-y-6">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      Upload physical bills, receipt images, or PDFs. Finch AI parses vendor info, items, and tax breakdowns dynamically.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 flex items-start gap-3">
                        <Check className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Auto-Extraction</h4>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Scans merchant, dates, invoice numbers, and individual items.</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 flex items-start gap-3">
                        <Check className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Interactive Audit</h4>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Audits totals, flags items, and alerts for mismatching taxes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <RefreshCw className="w-12 h-12 text-[#10B981] animate-spin mb-4" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Processing Bill Scan...</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Finch AI is parsing invoice layout, items list, and calculations</p>
                    <div className="w-full max-w-md bg-slate-200/50 dark:bg-slate-800/50 h-2.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-[#10B981] h-full transition-all duration-200 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">{uploadProgress}% Complete</span>
                  </div>
                )}
              </div>

              {!isUploading && (
                <div className="mt-8 pt-4 border-t" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
                  <Button
                    onClick={() => handleFileUpload(new File([""], "simulated_bill.jpg", { type: "image/jpeg" }))}
                    className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 border border-emerald-500/20 cursor-pointer transition-all active:scale-95 duration-100 flex items-center justify-center shadow-sm"
                  >
                    Simulate Sample Scan <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right Card: Stacked action buttons */}
            <div className="lg:col-span-5 glass-panel rounded-3xl p-8 border flex flex-col justify-center gap-4 bg-gradient-to-br from-white/70 to-white/40">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#64748B] mb-2 text-center lg:text-left">
                Select Entry Method
              </h3>
              
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                  }
                }}
                disabled={isUploading}
                className="w-full h-16 rounded-2xl flex items-center justify-between px-6 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:shadow-lg hover:shadow-indigo-500/20 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/20 cursor-pointer shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Camera size={20} className="text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-extrabold">Upload Image</span>
                    <span className="block text-[11px] opacity-75 font-normal">PNG, JPG, or Camera Capture</span>
                  </div>
                </div>
                <ChevronRight size={16} className="opacity-75 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = ".pdf";
                    fileInputRef.current.click();
                  }
                }}
                disabled={isUploading}
                className="w-full h-16 rounded-2xl flex items-center justify-between px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/20 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/20 cursor-pointer shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <FileText size={20} className="text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-extrabold">Upload PDF</span>
                    <span className="block text-[11px] opacity-75 font-normal">Standard e-receipt document</span>
                  </div>
                </div>
                <ChevronRight size={16} className="opacity-75 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-200/50" />
                <span className="text-[10px] font-black uppercase text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-200/50" />
              </div>

              <button
                onClick={handleManualEntryInit}
                disabled={isUploading}
                className="w-full h-16 rounded-2xl flex items-center justify-between px-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-200/50 dark:border-slate-800/50 cursor-pointer shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
                    <Plus size={20} className="text-[#6366F1] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-extrabold">Manual Entry</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">Add values without scanning</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* STEP 2: ONE-STEP REVIEW & EDIT PAGE */}
        {step === 2 && (
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-2" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Review & Audit Expense</h2>
                <p className="text-xs text-[#64748B] font-semibold mt-0.5">Verify extracted line items, prices, and merchant metadata</p>
              </div>
              <Badge className="bg-[#10B981]/10 text-[#10B981] font-bold text-[10px] uppercase tracking-wider px-3 py-1 border-transparent">
                Single-Step Audit
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Merchant & Vendor Details (Comes First) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                <div className="glass-panel rounded-3xl p-6 border bg-gradient-to-br from-white/70 to-white/40">
                  <div className="flex items-center gap-2 border-b pb-3 mb-4" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
                    <FileText size={16} className="text-[#10B981]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Merchant & Vendor Details</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
                          <th className="py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 w-2/5">Field Name</th>
                          <th className="py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Value</th>
                          <th className="py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right w-16">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-semibold" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)" }}>
                        {[
                          { key: "merchantName", label: "Merchant Name", val: merchantName, setter: setMerchantName },
                          { key: "invoiceNumber", label: "Invoice / Bill #", val: invoiceNumber, setter: setInvoiceNumber },
                          { key: "transactionDate", label: "Transaction Date", val: transactionDate, setter: setTransactionDate },
                          { key: "category", label: "Expense Category", val: category, setter: setCategory, isFlagged: flaggedFields.category },
                          { key: "paymentMethod", label: "Payment Method", val: paymentMethod, setter: setPaymentMethod },
                          { key: "cardEnding", label: "Card Ending", val: cardEnding, setter: setCardEnding },
                          { key: "taxId", label: "Tax / VAT ID", val: taxId, setter: setTaxId },
                          { key: "notes", label: "Account Notes / Memo", val: notes, setter: setNotes },
                        ].map((row) => (
                          <tr key={row.key} className="hover:bg-slate-500/5 transition-colors">
                            <td className="py-2.5 pr-4 text-xs font-black text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1.5">
                                {row.label}
                                {row.isFlagged && (
                                  <Badge className="bg-amber-100 text-amber-800 text-[8px] uppercase tracking-wider py-0 px-1 font-bold border-transparent">
                                    Audit
                                  </Badge>
                                )}
                                {correctedFields[row.key] && (
                                  <Badge className="bg-emerald-100 text-emerald-800 text-[8px] uppercase tracking-wider py-0 px-1 font-bold border-transparent">
                                    Corrected
                                  </Badge>
                                )}
                              </span>
                            </td>
                            <td className="py-1">
                              <input
                                id={`input-${row.key}`}
                                value={row.val}
                                onChange={(e) => {
                                  row.setter(e.target.value);
                                  setCorrectedFields(prev => ({ ...prev, [row.key]: true }));
                                }}
                                className="w-full h-8 px-2 border rounded-lg text-xs font-semibold focus:outline-none glass-input focus:border-[#10B981]"
                                style={{
                                  color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                                }}
                              />
                            </td>
                            <td className="py-1 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`input-${row.key}`);
                                  if (el) {
                                    el.focus();
                                    el.select();
                                  }
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#6366F1]/10 text-slate-400 hover:text-[#6366F1] transition-colors border-0 bg-transparent cursor-pointer ml-auto"
                                title="Edit field"
                              >
                                <Pencil size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Custom fields rows */}
                        {customFields.map((cf) => (
                          <tr key={cf.id} className="hover:bg-slate-500/5 transition-colors animate-in slide-in-from-top-1 duration-150">
                            <td className="py-1 pr-4">
                              <input
                                placeholder="Custom Field Name"
                                value={cf.key}
                                onChange={(e) => handleCustomFieldChange(cf.id, "key", e.target.value)}
                                className="w-full h-8 px-2 border border-dashed rounded-lg text-xs font-bold focus:outline-none glass-input border-[#6366F1]/40 focus:border-[#6366F1]"
                                style={{
                                  color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                                }}
                              />
                            </td>
                            <td className="py-1">
                              <input
                                id={`input-custom-${cf.id}`}
                                placeholder="Value"
                                value={cf.value}
                                onChange={(e) => handleCustomFieldChange(cf.id, "value", e.target.value)}
                                className="w-full h-8 px-2 border rounded-lg text-xs font-semibold focus:outline-none glass-input focus:border-[#10B981]"
                                style={{
                                  color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                                }}
                              />
                            </td>
                            <td className="py-1 text-right flex items-center justify-end gap-1 h-10">
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`input-custom-${cf.id}`);
                                  if (el) {
                                    el.focus();
                                    el.select();
                                  }
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#6366F1]/10 text-slate-400 hover:text-[#6366F1] transition-colors border-0 bg-transparent cursor-pointer"
                                title="Edit value"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => handleRemoveCustomField(cf.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition-colors border-0 bg-transparent cursor-pointer"
                                title="Delete field"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Custom Field Button */}
                  <div className="mt-4 pt-3 border-t flex justify-start" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
                    <button
                      onClick={handleAddCustomField}
                      className="h-8 px-3 rounded-lg flex items-center gap-1.5 bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] font-bold text-xs cursor-pointer border-0 transition-all hover:scale-105 active:scale-95"
                    >
                      <Plus size={14} />
                      <span>Add Custom Field</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Transaction Items & Amounts (Comes Second) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Items Card */}
                <div className="glass-panel rounded-3xl p-6 border bg-gradient-to-br from-white/70 to-white/40">
                  <div className="flex items-center gap-2 border-b pb-3 mb-4" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
                    <Receipt size={16} className="text-[#10B981]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Purchased Items List</h3>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Items List Details</span>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("input-itemsList");
                          if (el) {
                            el.focus();
                            (el as HTMLTextAreaElement).select();
                          }
                        }}
                        className="w-5 h-5 rounded hover:bg-[#6366F1]/10 text-slate-400 hover:text-[#6366F1] transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
                        title="Edit items list"
                      >
                        <Pencil size={11} />
                      </button>
                    </label>
                    <textarea
                      id="input-itemsList"
                      value={itemsList}
                      onChange={(e) => setItemsList(e.target.value)}
                      rows={5}
                      className="p-3 border rounded-xl text-xs font-semibold focus:outline-none glass-input focus:border-[#10B981] resize-none leading-relaxed"
                      placeholder="e.g. 1x Wireless Keyboard (₹45.00)"
                      style={{
                        color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                      }}
                    />
                  </div>
                </div>

                {/* Amounts Card */}
                <div className="glass-panel rounded-3xl p-6 border bg-gradient-to-br from-white/70 to-white/40">
                  <div className="flex items-center gap-2 border-b pb-3 mb-4" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
                    <CreditCard size={16} className="text-[#10B981]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Transaction Amounts</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "subtotal", label: "Subtotal", val: subtotal, setter: setSubtotal },
                      { key: "taxAmount", label: "Tax Amount / VAT", val: taxAmount, setter: setTaxAmount, isFlagged: flaggedFields.taxAmount },
                      { key: "discount", label: "Discount", val: discount, setter: setDiscount },
                      { key: "totalAmount", label: "Total Amount Due", val: totalAmount, setter: setTotalAmount },
                    ].map((field) => (
                      <div key={field.key} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                          <span>{field.label}</span>
                          {field.isFlagged && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[8px] uppercase tracking-wider py-0 px-1 font-bold animate-pulse">
                              Audit flag
                            </Badge>
                          )}
                          {correctedFields[field.key] && (
                            <Badge className="bg-emerald-100 text-emerald-800 text-[8px] uppercase tracking-wider py-0 px-1 font-bold">
                              Corrected
                            </Badge>
                          )}
                        </label>
                        <div className="relative flex items-center">
                          <input
                            id={`input-${field.key}`}
                            value={field.val}
                            onChange={(e) => {
                              let inputVal = e.target.value.trim();
                              if (inputVal && !inputVal.startsWith("₹")) {
                                inputVal = "₹" + inputVal;
                              }
                              field.setter(inputVal);
                              setCorrectedFields(prev => ({ ...prev, [field.key]: true }));
                            }}
                            className={`w-full h-9 pl-3 pr-8 border rounded-xl text-xs font-semibold focus:outline-none transition-all duration-150 glass-input focus:border-[#10B981] ${
                              field.isFlagged ? "border-amber-400" : ""
                            }`}
                            style={{
                              color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById(`input-${field.key}`);
                              if (el) {
                                el.focus();
                                (el as HTMLInputElement).select();
                              }
                            }}
                            className="absolute right-2 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#6366F1]/10 text-slate-400 hover:text-[#6366F1] transition-colors border-0 bg-transparent cursor-pointer"
                            title={`Edit ${field.label}`}
                          >
                            <Pencil size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Step 2 Bottom Actions */}
            <div className="flex justify-between mt-6 pt-4 border-t" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="h-11 px-5 rounded-xl font-semibold text-xs uppercase tracking-wider cursor-pointer glass-button border border-slate-300 dark:border-slate-700"
                style={{ color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }}
              >
                Back
              </Button>
              <Button
                onClick={handleSave}
                className="h-11 px-6 rounded-xl font-semibold bg-[#10B981] hover:bg-[#059669] text-white border-0 cursor-pointer flex items-center shadow-lg active:scale-95 duration-100"
              >
                <Save size={14} className="mr-2" />
                Confirm & Log Expense
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS BLOCK */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-300 max-w-lg mx-auto py-10 glass-panel rounded-3xl p-8 border"
            style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100/20 text-[#10B981] dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20 animate-bounce">
              <CheckCircle size={44} />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-2">
              Expense Logged Successfully!
            </h1>
            <p className="text-sm text-slate-400 mb-8 max-w-sm">
              Invoice #{invoiceNumber} for {merchantName} totaling {totalAmount} has been verified, categorized, and added to your expense logs.
            </p>

            <div className="flex gap-4 w-full">
              <Button
                onClick={resetAll}
                className="flex-1 h-11 rounded-xl font-semibold text-xs uppercase tracking-wider cursor-pointer glass-button border border-slate-300 dark:border-slate-700 active:scale-95 duration-100"
                style={{ color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }}
              >
                Scan Another Bill
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex-1 h-11 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs uppercase tracking-wider cursor-pointer border-0 active:scale-95 duration-100 shadow-md"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
