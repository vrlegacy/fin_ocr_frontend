// components/logo.tsx

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#059669] shadow-md border border-emerald-400/20"
      >
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v4c0 .5-.2 1-.6 1.4-.4.4-.9.6-1.4.6H6" />
          <path d="M18 14H6" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className="text-lg font-black tracking-tight"
          style={{
            color: "var(--foreground)",
            letterSpacing: "-0.5px"
          }}
        >
          Finch
        </span>

        <span
          className="hidden sm:block text-slate-500 dark:text-slate-400 font-medium"
          style={{
            fontSize: "10px",
          }}
        >
          AI-Powered Expense Engine
        </span>
      </div>
    </div>
  );
}