import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: number; // percent
  invertDelta?: boolean; // true when "down is good" (errors, load time)
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
}

const accentMap = {
  primary: "text-primary bg-primary/10",
  success: "text-[oklch(var(--success))] bg-[color:var(--success)]/10",
  warning: "text-[oklch(var(--warning))] bg-[color:var(--warning)]/10",
  destructive: "text-destructive bg-destructive/10",
  info: "text-[oklch(var(--info))] bg-[color:var(--info)]/10",
} as const;

export function KpiCard({ label, value, delta, invertDelta, icon: Icon, accent = "primary" }: Props) {
  const positive = delta === undefined ? null : invertDelta ? delta < 0 : delta > 0;
  return (
    <div className="group relative rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2", accentMap[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
              positive
                ? "bg-[color:var(--success)]/10 text-[oklch(var(--success))]"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}
