import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Download, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { APPLICATIONS, DEPARTMENTS, USERS } from "@/lib/mock-data";

export function GlobalFilters() {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-card/60 px-4 py-2.5 backdrop-blur">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search events, users, pages…" className="h-9 w-64 pl-8 text-sm" />
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Select defaultValue="7d">
          <SelectTrigger className="h-9 w-[160px]">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range…</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Application" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            {APPLICATIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {USERS.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="h-9">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
        </Button>
        <Button size="sm" className="h-9">
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export
        </Button>
      </div>
    </div>
  );
}
