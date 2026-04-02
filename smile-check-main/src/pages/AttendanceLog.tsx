import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Search, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AttendanceLog() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

  const { data: records, isLoading } = useQuery({
    queryKey: ["attendance", dateFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, employees(name, department, email)")
        .eq("date", dateFilter)
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = records?.filter((r: any) =>
    r.employees?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.employees?.department?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Log</h1>
          <p className="text-muted-foreground mt-1">Daily attendance records</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="pl-10 bg-secondary border-border" />
          </div>
          <div className="relative max-w-xs">
            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="pl-10 bg-secondary border-border" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <ClipboardList className="mx-auto h-10 w-10 mb-2 opacity-30" />
                    No attendance records found
                  </td></tr>
                ) : filtered.map((record: any) => (
                  <tr key={record.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{record.employees?.name ?? "Unknown"}</p>
                      {record.employees?.email && <p className="text-xs text-muted-foreground">{record.employees.email}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{record.employees?.department ?? "—"}</td>
                    <td className="px-6 py-4 text-sm font-mono text-foreground">
                      {new Date(record.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-foreground">
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        record.status === "present" ? "bg-success/10 text-success" :
                        record.status === "late" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-primary">
                      {record.confidence_score ? `${(record.confidence_score * 100).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
