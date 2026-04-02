import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type Employee = {
  id: string;
  name: string;
  email: string | null;
  department: string;
  position: string | null;
  is_active: boolean;
  photo_url: string | null;
};

function EmployeeForm({ employee, onSave, onCancel }: { employee?: Employee; onSave: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(employee?.name ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "General");
  const [position, setPosition] = useState(employee?.position ?? "");

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, email: email || null, department, position: position || null }); }} className="space-y-4">
      <div>
        <Label className="text-muted-foreground">Name *</Label>
        <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border mt-1" required />
      </div>
      <div>
        <Label className="text-muted-foreground">Email</Label>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary border-border mt-1" />
      </div>
      <div>
        <Label className="text-muted-foreground">Department *</Label>
        <Input value={department} onChange={e => setDepartment(e.target.value)} className="bg-secondary border-border mt-1" required />
      </div>
      <div>
        <Label className="text-muted-foreground">Position</Label>
        <Input value={position} onChange={e => setPosition(e.target.value)} className="bg-secondary border-border mt-1" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="gradient-primary text-primary-foreground flex-1">{employee ? "Update" : "Add"} Employee</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function Employees() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>();

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("name");
      if (error) throw error;
      return data as Employee[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (emp: any) => {
      const { error } = await supabase.from("employees").insert(emp);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee added!"); setDialogOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...emp }: any) => {
      const { error } = await supabase.from("employees").update(emp).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee updated!"); setDialogOpen(false); setEditing(undefined); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee removed"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = employees?.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">{employees?.length ?? 0} registered employees</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground glow-primary gap-2">
                <Plus className="h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">{editing ? "Edit" : "Add"} Employee</DialogTitle>
              </DialogHeader>
              <EmployeeForm
                employee={editing}
                onSave={(data) => editing ? updateMutation.mutate({ id: editing.id, ...data }) : addMutation.mutate(data)}
                onCancel={() => { setDialogOpen(false); setEditing(undefined); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="pl-10 bg-secondary border-border" />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="mx-auto h-10 w-10 mb-2 opacity-30" />
                    No employees found
                  </td></tr>
                ) : filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{emp.name}</p>
                          {emp.email && <p className="text-xs text-muted-foreground">{emp.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{emp.department}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{emp.position ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${emp.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => { setEditing(emp); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Delete this employee?")) deleteMutation.mutate(emp.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
