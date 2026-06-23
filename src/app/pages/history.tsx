import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Navbar } from "../components/navbar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Search, Calendar, Eye, Trash2, ShieldAlert, Hash, Receipt, CreditCard } from "lucide-react";

interface HistoryRecord {
  id: number;
  merchantName: string;
  invoiceNumber: string;
  category: string;
  paymentMethod: string;
  itemsList: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  enteredBy: string;
  uploadedAt: string;
  status: "Verified" | "Needs Review";
}


const apiUrl = (import.meta.env as any).VITE_API_URL || "https://finocr.onrender.com";

export function HistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "analytics">(
    location.state?.defaultTab || "list"
  );
  const { theme } = useTheme();
  const { token, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl}/api/expenses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mappedRecords: HistoryRecord[] = data.map((exp: any) => ({
            id: exp.id,
            merchantName: exp.merchant_name || "Unknown",
            invoiceNumber: exp.invoice_number || "None",
            category: exp.category || "Others",
            paymentMethod: exp.payment_method || "Cash",
            itemsList: exp.items_list ? exp.items_list.replace(/\n/g, ", ") : "",
            subtotal: exp.subtotal || "₹0.00",
            taxAmount: exp.tax_amount || "₹0.00",
            totalAmount: exp.total_amount || "₹0.00",
            enteredBy: "Self",
            uploadedAt: exp.transaction_date || new Date(exp.uploaded_at).toLocaleDateString(),
            status: exp.status || "Verified",
          }));
          setRecords(mappedRecords);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, [token]);

  const filteredRecords = records.filter((record) =>
    [
      record.merchantName,
      record.invoiceNumber,
      record.category,
      record.paymentMethod,
      record.itemsList,
      record.totalAmount,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleDeleteRecord = async (id: number, merchantName: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((record) => record.id !== id));
        toast.warning(`Removed ${merchantName} from expense history`);
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      console.error("Delete history record error:", error);
      toast.error("Failed to delete record due to network error");
    }
  };

  // Helper to extract numeric amount
  const parseAmount = (val: string) => {
    return parseFloat(val.replace(/[^\d.]/g, "") || "0");
  };

  // Derived Analytics Values
  const totalSpend = records.reduce((acc, r) => acc + parseAmount(r.totalAmount), 0);
  const averageSpend = records.length > 0 ? totalSpend / records.length : 0;
  const totalTax = records.reduce((acc, r) => acc + parseAmount(r.taxAmount), 0);

  // Category breakdown calculation
  const categoryTotals: Record<string, number> = {};
  records.forEach((r) => {
    categoryTotals[r.category] = (categoryTotals[r.category] || 0) + parseAmount(r.totalAmount);
  });

  // Payment method breakdown calculation
  const paymentTotals: Record<string, number> = {};
  records.forEach((r) => {
    paymentTotals[r.paymentMethod] = (paymentTotals[r.paymentMethod] || 0) + parseAmount(r.totalAmount);
  });

  return (
    <div className="flex min-h-screen transition-colors duration-300 flex-col bg-transparent">
      <Navbar />

      <div
        className="flex-1 px-4 pb-6 md:p-8 pt-24 md:pt-28 min-w-0 max-w-7xl mx-auto w-full"
      >
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1
              className="tracking-tight transition-colors"
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                marginBottom: "8px",
              }}
            >
              Expense History
            </h1>
            <p
              className="transition-colors"
              style={{
                fontSize: "14px",
                color: theme === "dark" ? "#94A3B8" : "#64748B",
              }}
            >
              Review bills and receipts processed through the OCR scan workflow.
            </p>
          </div>

          {/* ChatGPT-style glassmorphic switch tab pill toggle */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white/25 dark:bg-slate-950/25 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-md relative self-start md:self-center">
            <button
              onClick={() => setActiveTab("list")}
              className={`relative z-10 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "list"
                  ? "bg-white text-slate-800 shadow-md dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Transactions List
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`relative z-10 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white text-slate-800 shadow-md dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Expense Analytics
            </button>
          </div>
        </div>

        {activeTab === "list" ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Search Input Container */}
            <div
              className="rounded-2xl p-4 border transition-all duration-300 glass-panel"
              style={{
                borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
              }}
            >
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: theme === "dark" ? "#94A3B8" : "#64748B" }}
                />
                <Input
                  type="text"
                  placeholder="Search by merchant, invoice, category, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-0 rounded-xl focus-visible:ring-1 glass-input focus:border-[#10B981]"
                  style={{
                    fontSize: "14px",
                    color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                  }}
                />
              </div>
            </div>

            {/* Records Card Table */}
            <div
              className="rounded-3xl p-4 md:p-6 border transition-all duration-300 overflow-hidden glass-panel"
              style={{
                borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
              }}
            >
              <h2
                className="mb-5 tracking-tight transition-colors"
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                }}
              >
                Expense Records ({filteredRecords.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr style={{ borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(15, 23, 42, 0.08)" }}>
                      {["ID", "Merchant", "Invoice #", "Category", "Payment Method", "Items Purchased", "Amount", "Scan Date", "Actions"].map((heading) => (
                        <th
                          key={heading}
                          className="text-left pb-4 px-4"
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: theme === "dark" ? "#94A3B8" : "#64748B",
                            textTransform: "uppercase",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/10 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <Hash size={13} />
                            <span>{record.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="min-w-[180px]">
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {record.merchantName}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[100px]">
                            {record.invoiceNumber}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-[#10B981] dark:text-[#10B981] min-w-[150px]">
                            {record.category}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-600 dark:text-slate-400 min-w-[130px]">
                            {record.paymentMethod}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-700 dark:text-slate-300 min-w-[240px]">
                            {record.itemsList}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-bold text-[#10B981] dark:text-[#10B981] min-w-[100px]">
                            {record.totalAmount}
                          </div>
                          <div className="text-xs text-slate-400">
                            Subtotal: {record.subtotal}
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
                              className="h-9 px-3 rounded-xl flex items-center gap-2 shadow-none cursor-pointer glass-button border hover:bg-[#10B981] hover:text-white dark:hover:bg-[#10B981]"
                              style={{
                                borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.15)",
                                color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                              }}
                            >
                              <Eye size={14} />
                              View
                            </Button>
                            <Button
                              onClick={() => handleDeleteRecord(record.id, record.merchantName)}
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
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Statistics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div
                className="rounded-2xl p-5 border transition-all duration-300 glass-panel flex flex-col gap-1"
                style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
              >
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expense Spend</span>
                <span className="text-2xl font-extrabold text-[#10B981]">₹{totalSpend.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400">Total accumulated across logs</span>
              </div>
              <div
                className="rounded-2xl p-5 border transition-all duration-300 glass-panel flex flex-col gap-1"
                style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
              >
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average / Transaction</span>
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">₹{averageSpend.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400">Value of typical receipt logged</span>
              </div>
              <div
                className="rounded-2xl p-5 border transition-all duration-300 glass-panel flex flex-col gap-1"
                style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
              >
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tax Audited</span>
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">₹{totalTax.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400">GST/VAT amounts parsed</span>
              </div>
            </div>

            {/* 2. SVG Line Chart & Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Spline Chart */}
              <div
                className="rounded-3xl p-5 border transition-all duration-300 glass-panel lg:col-span-7 flex flex-col gap-4"
                style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Weekly Spend Trend</h3>
                  <p className="text-[10px] text-slate-400">Fluctuation curve of transactions</p>
                </div>
                <div className="w-full flex items-center justify-center p-2">
                  <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="50" y1="30" x2="450" y2="30" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="4 4" />
                    <line x1="50" y1="100" x2="450" y2="100" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="4 4" />
                    <line x1="50" y1="170" x2="450" y2="170" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="4 4" />

                    {/* Fill Area */}
                    <path
                      d="M 50 170 L 50 140 Q 150 160 250 180 Q 350 120 450 70 L 450 170 Z"
                      fill="url(#chartGrad)"
                    />

                    {/* Line */}
                    <path
                      d="M 50 140 Q 150 160 250 180 Q 350 120 450 70"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />

                    {/* Data Points */}
                    <circle cx="50" cy="140" r="5" fill="#10B981" stroke="#fff" strokeWidth="2" />
                    <circle cx="250" cy="180" r="5" fill="#10B981" stroke="#fff" strokeWidth="2" />
                    <circle cx="450" cy="70" r="5" fill="#10B981" stroke="#fff" strokeWidth="2" />

                    {/* Labels */}
                    <text x="50" y="192" fill="#94A3B8" fontSize="10" textAnchor="middle">27 May (Walmart)</text>
                    <text x="250" y="192" fill="#94A3B8" fontSize="10" textAnchor="middle">28 May (Uber)</text>
                    <text x="450" y="192" fill="#94A3B8" fontSize="10" textAnchor="middle">29 May (Amazon)</text>
                  </svg>
                </div>
              </div>

              {/* Category Progress Bars */}
              <div
                className="rounded-3xl p-5 border transition-all duration-300 glass-panel lg:col-span-5 flex flex-col gap-4"
                style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Category Breakdown</h3>
                  <p className="text-[10px] text-slate-400">Share percentages of logged purchases</p>
                </div>
                <div className="flex flex-col gap-4">
                  {Object.entries(categoryTotals).map(([cat, amount]) => {
                    const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
                    return (
                      <div key={cat} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-600 dark:text-slate-400">{cat}</span>
                          <span className="text-slate-800 dark:text-slate-100 font-bold">
                            ₹{amount.toFixed(2)} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Payment Method Insights */}
            <div
              className="rounded-3xl p-5 border transition-all duration-300 glass-panel flex flex-col gap-4"
              style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" }}
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Payment Breakdown</h3>
                <p className="text-[10px] text-slate-400">Spend insights grouped by accounts used</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(paymentTotals).map(([method, amount]) => {
                  const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
                  return (
                    <div key={method} className="bg-slate-100/30 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-center flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{method}</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">₹{amount.toFixed(2)}</span>
                      <span className="text-[10px] text-[#10B981] font-semibold">{pct.toFixed(0)}% of total</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
