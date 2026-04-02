import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardList, UserCheck, Clock } from "lucide-react";

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 ${accent ? "glow-primary" : ""}`}>
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${accent ? "gradient-primary" : "bg-primary/10"}`}>
          <Icon className={`h-6 w-6 ${accent ? "text-primary-foreground" : "text-primary"}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: todayRecords } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, employees(name, department)")
        .eq("date", today)
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalEmployees = employees?.length ?? 0;
  const presentToday = todayRecords?.length ?? 0;
  const lateToday = todayRecords?.filter(r => r.status === "late").length ?? 0;

  return (
    <AppLayout>
      <div className="space-y-8 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of today's attendance</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Employees" value={totalEmployees} />
          <StatCard icon={UserCheck} label="Present Today" value={presentToday} accent />
          <StatCard icon={Clock} label="Late Arrivals" value={lateToday} />
          <StatCard icon={ClipboardList} label="Absent" value={Math.max(0, totalEmployees - presentToday)} />
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Check-ins</h2>
          </div>
          <div className="divide-y divide-border">
            {todayRecords && todayRecords.length > 0 ? (
              todayRecords.slice(0, 8).map((record: any) => (
                <div key={record.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{record.employees?.name ?? "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{record.employees?.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-foreground">
                      {new Date(record.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      record.status === "present" ? "bg-success/10 text-success" :
                      record.status === "late" ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-muted-foreground">
                No check-ins recorded today. Start scanning faces!
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
