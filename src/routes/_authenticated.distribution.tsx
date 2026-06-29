import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { endpoints, type Distribution } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/distribution")({
  head: () => ({ meta: [{ title: "Distribution · ResourceTwin" }] }),
  component: DistributionPage,
});

function DistributionPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["distributions"], queryFn: endpoints.listDistributions });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Distribution>>({});

  const mut = useMutation({
    mutationFn: () => endpoints.createDistribution(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["distributions"] }); setOpen(false); setForm({}); toast.success("Distribution scheduled"); },
  });

  return (
    <AppShell title="Distribution">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Outgoing distributions</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="size-4" />New distribution</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule distribution</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>NGO</Label><Input value={form.ngo ?? ""} onChange={(e) => setForm({ ...form, ngo: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Item</Label><Input value={form.itemName ?? ""} onChange={(e) => setForm({ ...form, itemName: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Quantity (kg)</Label><Input type="number" value={form.quantityKg ?? ""} onChange={(e) => setForm({ ...form, quantityKg: Number(e.target.value) })} /></div>
                  <div className="space-y-1.5"><Label>Beneficiaries</Label><Input type="number" value={form.beneficiaries ?? ""} onChange={(e) => setForm({ ...form, beneficiaries: Number(e.target.value) })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={() => mut.mutate()} disabled={mut.isPending}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NGO</TableHead><TableHead>Item</TableHead><TableHead>Quantity</TableHead><TableHead>Beneficiaries</TableHead><TableHead>When</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.ngo}</TableCell>
                  <TableCell>{d.itemName}</TableCell>
                  <TableCell>{d.quantityKg} kg</TableCell>
                  <TableCell>{d.beneficiaries}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(d.distributedAt).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{d.status.replace("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
