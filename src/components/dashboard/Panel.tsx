import { cn } from "@/lib/utils";
import { Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PanelProps {
  title: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function Panel({ title, subtitle, className, actions, children }: PanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b px-5 py-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-3.5 w-3.5" /> Export PNG
              </DropdownMenuItem>
              <DropdownMenuItem>Drill down</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}
