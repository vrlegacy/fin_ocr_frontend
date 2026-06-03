// components/logo.tsx

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          background: "white",
        }}
      >
        <span className="text-black font-bold">N</span>
      </div>

      <div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "white",
          }}
        >
          Neuberg
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "white",
          }}
        >
          Smart Report Processing
        </div>
      </div>
    </div>
  );
}