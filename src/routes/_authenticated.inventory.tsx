import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { endpoints, type InventoryItem } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({ meta: [{ title: "Inventory · ResourceTwin" }] }),
  component: InventoryPage,
});

function statusVariant(s: InventoryItem["status"]) {
  switch (s) {
    case "ok": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "low": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "expiring": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "out": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  }
}

function InventoryPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["inventory"], queryFn: endpoints.listInventory });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<InventoryItem>>({ category: "grain", location: "Warehouse A" });

  const createMut = useMutation({
    mutationFn: () => endpoints.createInventory(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); setOpen(false); setForm({ category: "grain", location: "Warehouse A" }); toast.success("Item added"); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => endpoints.deleteInventory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); toast.success("Removed"); },
  });

  return (
    <AppShell title="Inventory">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resource inventory</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="size-4" />Add item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New inventory item</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Quantity (kg)</Label>
                    <Input type="number" value={form.quantityKg ?? ""} onChange={(e) => setForm({ ...form, quantityKg: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Threshold (kg)</Label>
                    <Input type="number" value={form.threshold ?? ""} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as InventoryItem["category"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grain">Grain</SelectItem>
                        <SelectItem value="vegetable">Vegetable</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="prepared">Prepared</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Expires at</Label>
                  <Input type="date" onChange={(e) => setForm({ ...form, expiresAt: new Date(e.target.value).toISOString() })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.name}>
                  {createMut.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={7} className="text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {data?.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{i.category}</TableCell>
                  <TableCell>{i.quantityKg} kg <span className="text-xs text-muted-foreground">/ {i.threshold}</span></TableCell>
                  <TableCell className="text-muted-foreground">{i.location}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(i.expiresAt).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="outline" className={statusVariant(i.status)}>{i.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => delMut.mutate(i.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
