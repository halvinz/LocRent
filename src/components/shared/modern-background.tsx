import { cn } from "@/lib/utils";

type ModernBackgroundVariant = "auth" | "admin";

interface ModernBackgroundProps {
  variant?: ModernBackgroundVariant;
  className?: string;
}

export function ModernBackground({
  variant = "auth",
  className,
}: ModernBackgroundProps) {
  if (variant === "admin") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden bg-slate-100",
          className,
        )}
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#e8eef6] to-slate-100" />
        <div className="absolute -right-12 top-[-5%] h-48 w-48 rounded-full bg-[#1e3a5f]/12 blur-[70px] sm:-right-24 sm:h-72 sm:w-72 sm:blur-[90px]" />
        <div className="absolute -left-8 bottom-[10%] h-40 w-40 rounded-full bg-indigo-400/10 blur-[60px] sm:-left-16 sm:h-64 sm:w-64 sm:blur-[80px]" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-cyan-400/10 blur-[50px] sm:h-48 sm:w-48 sm:blur-[70px]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(30,58,95,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,58,95,0.04) 1px, transparent 1px)",
            backgroundSize: "3rem 3rem",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-slate-950",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0c2340] to-slate-950" />
      <div className="absolute -left-16 top-[-10%] h-56 w-56 rounded-full bg-[#1e3a5f]/50 blur-[80px] sm:-left-32 sm:h-[28rem] sm:w-[28rem] sm:blur-[100px]" />
      <div className="absolute -right-12 top-[20%] h-48 w-48 rounded-full bg-indigo-500/25 blur-[70px] sm:-right-24 sm:h-[22rem] sm:w-[22rem] sm:blur-[90px]" />
      <div className="absolute bottom-[-8%] left-1/4 h-52 w-52 rounded-full bg-cyan-500/15 blur-[80px] sm:left-1/3 sm:h-[26rem] sm:w-[26rem] sm:blur-[110px]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "3.5rem 3.5rem",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-900/30" />
    </div>
  );
}
