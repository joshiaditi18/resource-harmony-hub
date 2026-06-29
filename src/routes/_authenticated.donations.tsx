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
import { endpoints, type Donation } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/donations")({
  head: () => ({ meta: [{ title: "Donations · ResourceTwin" }] }),
  component: DonationsPage,
});

function DonationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["donations"], queryFn: endpoints.listDonations });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Donation>>({});

  const mut = useMutation({
    mutationFn: () => endpoints.createDonation(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["donations"] }); setOpen(false); setForm({}); toast.success("Donation logged"); },
  });

  return (
    <AppShell title="Donations">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Incoming donations</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="size-4" />Log donation</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New donation</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Donor</Label><Input value={form.donor ?? ""} onChange={(e) => setForm({ ...form, donor: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Item</Label><Input value={form.itemName ?? ""} onChange={(e) => setForm({ ...form, itemName: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Quantity (kg)</Label><Input type="number" value={form.quantityKg ?? ""} onChange={(e) => setForm({ ...form, quantityKg: Number(e.target.value) })} /></div>
              </div>
              <DialogFooter><Button onClick={() => mut.mutate()} disabled={mut.isPending}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead><TableHead>Item</TableHead><TableHead>Quantity</TableHead><TableHead>Received</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.donor}</TableCell>
                  <TableCell>{d.itemName}</TableCell>
                  <TableCell>{d.quantityKg} kg</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(d.receivedAt).toLocaleString()}</TableCell>
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
