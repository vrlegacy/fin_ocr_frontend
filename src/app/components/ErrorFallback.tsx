import { useRouteError, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function ErrorFallback() {
  const error: any = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  // Extract message and stack
  const errorMessage = error?.message || error?.statusText || "An unexpected error occurred.";
  const errorStack = error?.stack || "No additional technical details available.";

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate("/dashboard");
    window.location.reload(); // Hard reload to clear component states
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Warning Icon Banner */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6 mx-auto animate-bounce">
          <AlertTriangle size={32} />
        </div>

        {/* Text Headers */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white mb-2">
            Unexpected Application Error
          </h1>
          <p className="text-slate-400 text-sm">
            Something went wrong while rendering this page. The application encountered an unexpected runtime failure.
          </p>
        </div>

        {/* Main Error Box */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-6 text-sm font-semibold text-rose-300 font-mono break-all flex items-start gap-3">
          <span className="text-rose-400 flex-shrink-0 mt-0.5">▶</span>
          <span>{errorMessage}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            onClick={handleReload}
            className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={16} />
            Reload Page
          </Button>
          <Button
            onClick={handleGoHome}
            className="flex-1 h-11 rounded-xl bg-[#008060] hover:bg-[#00664d] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Home size={16} />
            Dashboard
          </Button>
        </div>

        {/* Technical Details Accordion */}
        <div className="border-t border-slate-800/80 pt-5">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-0 p-0 text-left"
          >
            <span>TECHNICAL DETAILS</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {showDetails && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-slate-950 border border-slate-900 p-4 font-mono text-[10px] text-slate-500 leading-normal whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-800">
              {errorStack}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
