import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/navbar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { apiUrl } from "../lib/api";
import {
  Upload,
  FileText,
  Search,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Copy,
  Pencil,
  Check,
  Save,
  Receipt,
  CreditCard,
  TrendingUp,
  Calendar,
  Camera,
  ChevronRight,
  ChevronLeft,
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

export function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const { token, isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Floating Upload Menu & Dialog states
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Living Dynamic Island states
  const [isIslandExpanded, setIsIslandExpanded] = useState(false);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Swipeable AI Insights states
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);

  // Dynamic category breakdown state
  const [categoriesBreakdown, setCategoriesBreakdown] = useState<any[]>([]);

  // Core Datastore
  const [recentUploads, setRecentUploads] = useState<any[]>([]);

  // Detail Modal States
  const [recordsData, setRecordsData] = useState<Record<string, any>>({});
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [deletedFields, setDeletedFields] = useState<Record<string, boolean>>({});
  const [correctedFields, setCorrectedFields] = useState<Record<string, boolean>>({});

  const updateAnalysis = async () => {
    if (!token) return;
    try {
      const catRes = await fetch(`${apiUrl}/api/expenses/analysis/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategoriesBreakdown(catData);
      }
      const insRes = await fetch(`${apiUrl}/api/expenses/analysis/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (insRes.ok) {
        const insData = await insRes.json();
        if (Array.isArray(insData) && insData.length > 0) {
          setInsights(insData);
        }
      }
    } catch (err) {
      console.error("Error updating analysis:", err);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl}/api/expenses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formattedTimeline = data.map((exp: any) => ({
            id: String(exp.id),
            fileName: exp.invoice_number ? `${exp.invoice_number}.pdf` : "receipt.pdf",
            merchant: exp.merchant_name || "Unknown",
            itemsPurchased: exp.notes || exp.merchant_name || "Expenses",
            date: exp.transaction_date || "Today",
            amount: exp.total_amount || "₹0.00"
          }));
          setRecentUploads(formattedTimeline);

          const formattedRecords: Record<string, any> = {};
          data.forEach((exp: any) => {
            formattedRecords[String(exp.id)] = {
              merchantName: exp.merchant_name,
              transactionDate: exp.transaction_date,
              invoiceNumber: exp.invoice_number,
              category: exp.category,
              paymentMethod: exp.payment_method,
              taxId: exp.tax_id,
              notes: exp.notes,
              itemsList: exp.items_list,
              subtotal: exp.subtotal,
              taxAmount: exp.tax_amount,
              totalAmount: exp.total_amount,
              discount: exp.discount,
              cardEnding: exp.card_ending,
            };
          });
          setRecordsData(formattedRecords);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
    updateAnalysis();
  }, [token]);

  // Helper to collapse menu on outer click
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
        setIsUploadMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse numeric amount
  const parseAmountVal = (val: string) => {
    return parseFloat(val.replace(/[^\d.]/g, "") || "0");
  };

  // Dynamic calculations
  const todayTransactions = recentUploads.filter(t => t.date.toLowerCase() === "today");
  const todaySpentTotal = todayTransactions.reduce((acc, curr) => acc + parseAmountVal(curr.amount), 0);
  const displaySpentToday = todaySpentTotal;

  const totalMonthlySpend = recentUploads.reduce((acc, curr) => acc + parseAmountVal(curr.amount), 0);
  const budgetTarget = 50000;
  const budgetRemaining = Math.max(0, budgetTarget - totalMonthlySpend);

  const uploadAndScanFile = async (file: File) => {
    setIsUploadMenuOpen(false);
    setUploadingFile(file);
    setUploadProgress(10);
    toast.loading(`Uploading "${file.name}"...`, { id: "upload-toast" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(35);
      const scanRes = await fetch(`${apiUrl}/api/ocr/scan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(70);
      if (!scanRes.ok) {
        throw new Error("Failed to scan file via OCR");
      }

      const extracted = await scanRes.json();
      setUploadProgress(85);

      // Create the expense record in Supabase database
      const saveRes = await fetch(`${apiUrl}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          merchant_name: extracted.merchantName,
          transaction_date: extracted.transactionDate,
          invoice_number: extracted.invoiceNumber,
          category: extracted.category,
          payment_method: extracted.paymentMethod,
          tax_id: extracted.taxId,
          notes: extracted.notes,
          items_list: extracted.itemsList,
          subtotal: extracted.subtotal,
          tax_amount: extracted.taxAmount,
          total_amount: extracted.totalAmount,
          discount: extracted.discount,
          card_ending: extracted.cardEnding,
          status: "Verified",
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save expense record");
      }

      const savedExpense = await saveRes.json();
      setUploadProgress(100);

      const newId = String(savedExpense.id);
      const newUpload = {
        id: newId,
        fileName: file.name,
        merchant: savedExpense.merchant_name || "Unknown",
        itemsPurchased: savedExpense.notes || "Receipt Expense",
        date: savedExpense.transaction_date || "Today",
        amount: savedExpense.total_amount || "₹0.00",
      };

      setRecentUploads((prevList) => [newUpload, ...prevList]);
      setRecordsData((prev) => ({
        ...prev,
        [newId]: {
          merchantName: savedExpense.merchant_name,
          transactionDate: savedExpense.transaction_date,
          invoiceNumber: savedExpense.invoice_number,
          category: savedExpense.category,
          paymentMethod: savedExpense.payment_method,
          taxId: savedExpense.tax_id,
          notes: savedExpense.notes,
          itemsList: savedExpense.items_list,
          subtotal: savedExpense.subtotal,
          taxAmount: savedExpense.tax_amount,
          totalAmount: savedExpense.total_amount,
          discount: savedExpense.discount,
          cardEnding: savedExpense.card_ending,
        },
      }));

      setSelectedRecordId(newId);
      setSelectedRecord({
        merchantName: savedExpense.merchant_name,
        transactionDate: savedExpense.transaction_date,
        invoiceNumber: savedExpense.invoice_number,
        category: savedExpense.category,
        paymentMethod: savedExpense.payment_method,
        taxId: savedExpense.tax_id,
        notes: savedExpense.notes,
        itemsList: savedExpense.items_list,
        subtotal: savedExpense.subtotal,
        taxAmount: savedExpense.tax_amount,
        totalAmount: savedExpense.total_amount,
        discount: savedExpense.discount,
        cardEnding: savedExpense.card_ending,
      });

      setEditingFields({});
      setDeletedFields({});
      setCorrectedFields({});
      updateAnalysis();

      toast.success(`"${file.name}" processed successfully!`, { id: "upload-toast" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to parse receipt", { id: "upload-toast" });
    } finally {
      setTimeout(() => {
        setUploadingFile(null);
        setUploadProgress(0);
      }, 800);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAndScanFile(e.target.files[0]);
    }
  };

  const handleDeleteUpload = async (id: string, merchant: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setRecentUploads((prev) => prev.filter((item) => item.id !== id));
        if (selectedRecordId === id) {
          setSelectedRecord(null);
          setSelectedRecordId(null);
        }
        updateAnalysis();
        toast.warning(`Deleted transaction card for ${merchant}`);
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete record due to network error");
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    if (!selectedRecordId) return;
    setRecordsData((prev) => ({
      ...prev,
      [selectedRecordId]: {
        ...prev[selectedRecordId],
        [key]: value,
      },
    }));
    setSelectedRecord((prev: any) => ({
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
        next ? "Editing enabled" : "Changes saved"
      );
      return next;
    });
  };

  const handleCopyAll = () => {
    if (!selectedRecord) return;
    const textToCopy = [
      `Merchant Name: ${selectedRecord.merchantName || ""}`,
      `Transaction Date: ${selectedRecord.transactionDate || ""}`,
      `Invoice Number: ${selectedRecord.invoiceNumber || ""}`,
      `Category: ${selectedRecord.category || ""}`,
      `Payment Method: ${selectedRecord.paymentMethod || ""}`,
      `Tax ID: ${selectedRecord.taxId || ""}`,
      `Notes: ${selectedRecord.notes || ""}`,
      `Items: ${selectedRecord.itemsList || ""}`,
      `Subtotal: ${selectedRecord.subtotal || ""}`,
      `Tax: ${selectedRecord.taxAmount || ""}`,
      `Total: ${selectedRecord.totalAmount || ""}`,
      `Discount: ${selectedRecord.discount || ""}`,
      `Card Ending: ${selectedRecord.cardEnding || ""}`,
    ].join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    toast.success("Copied details to clipboard");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDeleteRecord = () => {
    if (!selectedRecordId) return;
    handleDeleteUpload(selectedRecordId, selectedRecord.merchantName);
  };

  const handleCopyField = (key: string, label: string) => {
    if (!selectedRecord) return;
    const value = selectedRecord[key] || "";
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
    toast.success(`Hidden ${label}`);
  };

  const handleSaveToDatabase = async () => {
    if (!selectedRecordId || !selectedRecord) return;
    
    toast.promise(
      (async () => {
        const res = await fetch(`${apiUrl}/api/expenses/${selectedRecordId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            merchant_name: selectedRecord.merchantName,
            transaction_date: selectedRecord.transactionDate,
            invoice_number: selectedRecord.invoiceNumber,
            category: selectedRecord.category,
            payment_method: selectedRecord.paymentMethod,
            tax_id: selectedRecord.taxId,
            notes: selectedRecord.notes,
            items_list: selectedRecord.itemsList,
            subtotal: selectedRecord.subtotal,
            tax_amount: selectedRecord.taxAmount,
            total_amount: selectedRecord.totalAmount,
            discount: selectedRecord.discount,
            card_ending: selectedRecord.cardEnding,
          })
        });
        if (!res.ok) {
          throw new Error("Sync failed");
        }
        
        // Update the list of uploaded cards in dashboard list
        setRecentUploads((prev) =>
          prev.map((item) =>
            item.id === selectedRecordId
              ? {
                  ...item,
                  merchant: selectedRecord.merchantName,
                  amount: selectedRecord.totalAmount,
                  date: selectedRecord.transactionDate
                }
              : item
          )
        );
        updateAnalysis();
      })(),
      {
        loading: "Syncing transactions...",
        success: "Synced successfully!",
        error: "Sync failed.",
      }
    );
  };

  // Filtered timeline transactions
  const filteredTimeline = recentUploads.filter((tx) =>
    tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.itemsPurchased.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.amount.includes(searchQuery)
  );

  // Group transactions by date
  const groupedTransactions: Record<string, typeof recentUploads> = {};
  filteredTimeline.forEach((tx) => {
    const date = tx.date;
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(tx);
  });

  return (
    <div className="flex min-h-screen transition-colors duration-300 flex-col bg-transparent relative pb-16">
      <Navbar />

      <div className="flex-1 px-4 md:px-8 pt-20 md:pt-28 max-w-7xl mx-auto w-full flex flex-col items-center">
        
        {/* Header Block with Inline Re-positioned Dynamic Island */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mb-10 pb-6 border-b border-slate-200/20">
          <div className="text-left">
            <span className="text-xs uppercase tracking-widest text-[#64748B] font-bold">
              Welcome, {user?.name || "User"}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mt-1 tracking-tight">
              ₹{displaySpentToday.toLocaleString("en-IN")} spent today
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-semibold">
              {todayTransactions.length} receipts processed · 2 categories updated
            </p>
          </div>

          {/* Quick Upload Header Button Trigger */}
          <div className="flex-shrink-0 relative">
            <button
              onClick={() => navigate("/ocr-entry")}
              className="h-11 px-5 rounded-full flex items-center gap-2 text-white shadow-xl transition-all duration-300 cursor-pointer font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 border border-white/35"
              style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(79, 70, 229, 0.9) 100%)",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.45)"
              }}
            >
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Desktop Main Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Column: Daily Snapshot, AI Insights */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Snapshot Subhead */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#64748B] mb-3">
                Today's Snapshot
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="glass-panel rounded-3xl p-5 border flex flex-col justify-between h-28 bg-gradient-to-br from-white/70 to-white/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Today</span>
                  <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">
                    ₹{displaySpentToday.toLocaleString("en-IN")}
                  </h3>
                </div>

                <div className="glass-panel rounded-3xl p-5 border flex flex-col justify-between h-28 bg-gradient-to-br from-white/70 to-white/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Budget remaining</span>
                  <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">
                    ₹{budgetRemaining.toLocaleString("en-IN")}
                  </h3>
                </div>
              </div>
            </div>

            {/* Smart Insights Stack */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#64748B] mb-3">
                Smart AI Insights
              </h2>
              
              <div className="glass-panel rounded-3xl p-5 border flex flex-col gap-2 min-h-[108px] justify-center bg-gradient-to-br from-white/70 to-white/40">
                <div className="flex items-center gap-2 mb-0.5">
                  <TrendingUp size={14} className="text-[#6366F1]" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-[#6366F1]">
                    Finch AI Recommendation
                  </span>
                </div>

                {insights.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-[#0F172A] leading-snug animate-in fade-in duration-300">
                        {insights[activeInsightIndex]}
                      </p>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setActiveInsightIndex(prev => (prev === 0 ? insights.length - 1 : prev - 1))}
                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white/65 hover:bg-white text-slate-600 border border-slate-200/40 cursor-pointer transition-all"
                        >
                          <ChevronLeft size={12} />
                        </button>
                        <button
                          onClick={() => setActiveInsightIndex(prev => (prev === insights.length - 1 ? 0 : prev + 1))}
                          className="w-6 h-6 rounded-full flex items-center justify-center bg-white/65 hover:bg-white text-slate-600 border border-slate-200/40 cursor-pointer transition-all"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-center gap-1.5 mt-2">
                      {insights.map((_, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveInsightIndex(idx)}
                          className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                            idx === activeInsightIndex ? "bg-[#6366F1] w-3" : "bg-[#64748B]/30"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-[#64748B] leading-snug py-2">
                    No insights available yet. Upload more receipts to generate automated AI insights.
                  </p>
                )}

                <div className="flex justify-end mt-2 pt-2 border-t border-slate-200/10">
                  <button
                    onClick={() => navigate("/history", { state: { defaultTab: "analytics" } })}
                    className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#6366F1] hover:text-[#5053D4] hover:gap-1.5 transition-all border-0 bg-transparent cursor-pointer p-0"
                  >
                    <span>More Insights</span>
                    <ChevronRight size={12} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic breakdown list for widescreen visibility */}
            <div className="hidden lg:block">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#64748B] mb-3">
                Monthly Breakdown List
              </h2>
              <div className="glass-panel rounded-3xl p-5 border bg-white/40 space-y-3">
                {categoriesBreakdown.length > 0 ? (
                  categoriesBreakdown.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
                        <span>{item.name}</span>
                        <span>{item.amount} ({item.percent}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No expenses logged yet</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Wallet timeline list & search filter */}
          <div className="lg:col-span-7 flex flex-col gap-4 w-full">
            
            <div className="flex items-center justify-between gap-4 mb-1">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#64748B]">
                Recent Expenses Timeline
              </h2>
              
              {/* Search Widget */}
              <div className="relative w-48 sm:w-64 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                <input
                  type="text"
                  placeholder="Filter expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border focus:outline-none transition-all glass-input"
                />
              </div>
            </div>

            <div className="space-y-6">
              {Object.keys(groupedTransactions).map((date) => (
                <div key={date} className="space-y-3">
                  {/* Date Subhead */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#64748B] tracking-wider">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-slate-200/50" />
                  </div>

                  {/* List of rows */}
                  <div className="space-y-3">
                    {groupedTransactions[date].map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          const rec = recordsData[tx.id];
                          if (rec) {
                            setSelectedRecordId(tx.id);
                            setSelectedRecord(rec);
                            setIsEditing(false);
                            setEditingFields({});
                            setDeletedFields({});
                            setCorrectedFields({});
                          } else {
                            toast.error("Record details not found.");
                          }
                        }}
                        className="glass-panel cursor-pointer p-4 md:p-5 rounded-3xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-br from-white/70 to-white/40"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                            {tx.merchant.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-[#0F172A]">{tx.merchant}</h4>
                              <Badge className="bg-[#6366F1]/10 text-[#6366F1] font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 border-transparent">
                                {recordsData[tx.id]?.category || "Expense"}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#64748B] font-semibold mt-1 max-w-sm truncate">
                              {tx.itemsPurchased}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-black text-base text-[#0F172A]">{tx.amount}</span>
                            <p className="text-[10px] text-[#64748B] font-bold mt-0.5">
                              {recordsData[tx.id]?.paymentMethod || "UPI"}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-[#64748B] hidden md:block" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(groupedTransactions).length === 0 && (
                <div className="text-center py-12 glass-panel rounded-3xl p-6 border bg-white/30">
                  <p className="text-sm font-semibold text-slate-500">
                    No transactions match "{searchQuery}"
                  </p>
                </div>
              )}
            </div>

            {/* View History Link */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => navigate("/history", { state: { defaultTab: "list" } })}
                className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#6366F1] hover:text-[#5053D4] hover:gap-1.5 transition-all border-0 bg-transparent cursor-pointer p-0"
              >
                <span>View History</span>
                <ChevronRight size={12} strokeWidth={3} />
              </button>
            </div>

          </div>
        </div>

      </div>



      {/* Simulated Scanner Glass Overlay */}
      {uploadingFile && (
        <div className="fixed inset-0 bg-[#0F172A]/10 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-lg mb-4 animate-bounce">
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-black text-[#0F172A] mb-1 truncate max-w-[240px]">
              Scanning {uploadingFile.name}
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Finch AI is parsing merchants, items, and taxes...
            </p>

            <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-[#10B981] h-full transition-all duration-150 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500">{uploadProgress}% Complete</span>
          </div>
        </div>
      )}

      {/* Detailed review slide-over drawer modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-[#0F172A]/20 backdrop-blur-sm z-50 flex justify-end items-end lg:items-stretch p-0">
          
          {/* Backdrop exit click */}
          <div className="absolute inset-0 z-0" onClick={() => setSelectedRecord(null)} />
          
          <div className="glass-panel w-full lg:w-[480px] h-[85vh] lg:h-full rounded-t-3xl lg:rounded-none lg:rounded-l-3xl border-t lg:border-t-0 lg:border-l shadow-2xl flex flex-col overflow-hidden relative z-10 animate-in slide-in-from-bottom lg:slide-in-from-right duration-300 bg-white/70">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200/40 flex items-center justify-between flex-shrink-0 bg-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white font-bold flex items-center justify-center text-xs">
                  {selectedRecord.merchantName ? selectedRecord.merchantName.slice(0, 2).toUpperCase() : "TX"}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A]">{selectedRecord.merchantName}</h3>
                  <p className="text-[10px] text-[#64748B] font-bold mt-0.5">
                    Invoice #: {selectedRecord.invoiceNumber} · {selectedRecord.transactionDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500 text-white font-bold text-[8px] uppercase tracking-wider py-0.5 px-2 border-transparent">
                  Verified
                </Badge>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded-full hover:bg-slate-200/50 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-transparent">
              
              {/* Raw parsed text */}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#64748B] block mb-1.5">Raw Extracted Text</span>
                <div className="rounded-2xl p-3 font-mono text-[10px] leading-relaxed border border-slate-200/40 text-[#64748B] bg-white/20 select-text">
                  Merchant: {selectedRecord.merchantName} | Date: {selectedRecord.transactionDate} | Invoice: {selectedRecord.invoiceNumber}<br />
                  Category: {selectedRecord.category} | Payment: {selectedRecord.paymentMethod} | Tax ID: {selectedRecord.taxId}<br />
                  Notes: {selectedRecord.notes}<br />
                  Items: {selectedRecord.itemsList?.replace(/\n/g, ", ")}<br />
                  Subtotal: {selectedRecord.subtotal} | Tax: {selectedRecord.taxAmount} | Total: {selectedRecord.totalAmount}
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-6">
                {fieldSections.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <div key={section.title} className="space-y-3.5">
                      <div className="flex items-center gap-2 border-b border-slate-200/20 pb-1.5">
                        <SectionIcon size={12} className="text-[#6366F1]" />
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-[#0F172A]">{section.title}</h4>
                      </div>

                      <div className="space-y-3.5">
                        {section.fields
                          .filter((field) => !deletedFields[field.key])
                          .map((field) => (
                            <div key={field.key} className="flex flex-col gap-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                                <span>{field.label}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-mono ${
                                  correctedFields[field.key] ? "bg-amber-100 text-amber-800 font-semibold" : "bg-slate-100 text-slate-400"
                                }`}>
                                  {correctedFields[field.key] ? "Corrected" : "OCR"}
                                </span>
                              </label>

                              <div className="flex items-center gap-1.5">
                                {field.key === "itemsList" ? (
                                  <textarea
                                    id={`input-${field.key}`}
                                    value={selectedRecord[field.key] || ""}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    readOnly={!isEditing && !editingFields[field.key]}
                                    rows={2}
                                    className={`flex-1 p-2 border rounded-xl text-xs font-semibold glass-input resize-none ${
                                      isEditing || editingFields[field.key] ? "border-[#10B981]" : "border-transparent"
                                    }`}
                                  />
                                ) : (
                                  <input
                                    id={`input-${field.key}`}
                                    value={selectedRecord[field.key] || ""}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    readOnly={!isEditing && !editingFields[field.key]}
                                    className={`flex-1 h-8 px-2.5 border rounded-xl text-xs font-semibold glass-input ${
                                      isEditing || editingFields[field.key] ? "border-[#10B981]" : "border-transparent"
                                    }`}
                                  />
                                )}

                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => handleCopyField(field.key, field.label)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                  >
                                    {copiedFields[field.key] ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                  </button>

                                  <button
                                    onClick={() => handleToggleFieldEdit(field.key, field.label)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                      editingFields[field.key] ? "bg-red-50 text-red-500" : "hover:bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {editingFields[field.key] ? <Check size={12} /> : <Pencil size={12} />}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteField(field.key, field.label)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-slate-200/40 flex flex-wrap gap-2 items-center justify-end bg-slate-50/20 flex-shrink-0">
              <Button
                onClick={handleCopyAll}
                variant="outline"
                className="h-8 px-3 rounded-lg text-xs font-semibold glass-button border border-slate-200"
              >
                {copiedAll ? "Copied" : "Copy All"}
              </Button>

              <Button
                onClick={handleToggleEdit}
                variant="outline"
                className={`h-8 px-3 rounded-lg text-xs font-semibold ${
                  isEditing ? "bg-amber-600 text-white border-0 animate-pulse" : "glass-button border border-slate-200"
                }`}
              >
                {isEditing ? "Lock" : "Edit"}
              </Button>

              <Button
                onClick={handleDeleteRecord}
                variant="outline"
                className="h-8 px-3 rounded-lg text-xs font-semibold text-red-500 border-red-200/30 hover:bg-red-50"
              >
                Delete
              </Button>

              <Button
                onClick={handleSaveToDatabase}
                className="h-8 px-3 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-[#059669] text-white border-0 cursor-pointer shadow-sm active:scale-95 duration-100"
              >
                Sync
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}