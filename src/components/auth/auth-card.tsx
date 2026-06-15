import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-white/40 bg-white/90 p-5 shadow-2xl backdrop-blur-md sm:p-8",
        className,
      )}
    >
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>
      {children}
      {footer && <div className="mt-6 border-t border-slate-200/80 pt-6">{footer}</div>}
    </div>
  );
}

function AuthField({
  id,
  label,
  type = "text",
  name,
  placeholder,
  autoComplete,
  icon,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  icon: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export { AuthField };
