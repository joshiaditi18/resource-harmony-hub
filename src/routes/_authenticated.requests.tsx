import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ClipboardList, Plus, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { endpoints, type CreateRequestInput, type RequestStatus, type ResourceRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({
    meta: [
      { title: "Resource requests · ResourceTwin" },
      { name: "description", content: "Ask for resources, review fulfillment status, and keep inventory aligned with distribution." },
      { property: "og:title", content: "Resource requests · ResourceTwin" },
      { property: "og:description", content: "Manage food resource requests from ask through fulfillment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestsPage,
});

const emptyForm: CreateRequestInput = {
  itemName: "",
  quantityKg: 0,
  beneficiaries: 0,
  neededBy: "",
  notes: "",
};

function statusClass(status: RequestStatus) {
  if (status === "fulfilled") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
  if (status === "rejected") return "border-rose-500/20 bg-rose-500/10 text-rose-600";
  if (status === "approved") return "border-sky-500/20 bg-sky-500/10 text-sky-600";
  return "border-amber-500/20 bg-amber-500/10 text-amber-600";
}

function RequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateRequestInput>(emptyForm);
  const { data: requests, isLoading } = useQuery({ queryKey: ["requests"], queryFn: endpoints.listRequests });
  const isAdmin = user?.role === "admin";

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["requests"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      queryClient.invalidateQueries({ queryKey: ["distributions"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: () => endpoints.createRequest({ ...form, ngo: form.ngo || user?.organization || user?.name }),
    onSuccess: async () => {
      await refreshData();
      setForm(emptyForm);
      setOpen(false);
      toast.success("Request sent for review");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not send request"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Extract<RequestStatus, "approved" | "fulfilled" | "rejected"> }) =>
      endpoints.updateRequest(id, { status }),
    onSuccess: async (request) => {
      await refreshData();
      toast.success(request.status === "fulfilled" ? "Request fulfilled and inventory updated" : `Request ${request.status}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update request"),
  });

  return (
    <AppShell title="Resource requests">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Requests stay linked to inventory and distribution records from start to finish.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4" />Ask for resources</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New resource request</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Resource needed</Label><Input value={form.itemName} onChange={(event) => setForm({ ...form, itemName: event.target.value })} placeholder="Rice, vegetables, prepared meals" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Quantity (kg)</Label><Input type="number" min="1" value={form.quantityKg || ""} onChange={(event) => setForm({ ...form, quantityKg: Number(event.target.value) })} /></div>
                <div className="space-y-1.5"><Label>Beneficiaries</Label><Input type="number" min="1" value={form.beneficiaries || ""} onChange={(event) => setForm({ ...form, beneficiaries: Number(event.target.value) })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Needed by</Label><Input type="date" value={form.neededBy} onChange={(event) => setForm({ ...form, neededBy: event.target.value })} /></div>
              <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Add delivery or dietary details" /></div>
            </div>
            <DialogFooter><Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.itemName || form.quantityKg < 1 || form.beneficiaries < 1}>{createMutation.isPending ? "Sending…" : "Send request"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="size-4" />Request queue</CardTitle>
          <CardDescription>{isAdmin ? "Review every request and fulfill only when inventory is available." : "Track the requests your organization has submitted."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Organization</TableHead><TableHead>Resource</TableHead><TableHead>Quantity</TableHead><TableHead>Needed by</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6} className="text-muted-foreground">Loading requests…</TableCell></TableRow>}
              {!isLoading && !requests?.length && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No requests yet.</TableCell></TableRow>}
              {requests?.map((request) => <RequestRow key={request.id} request={request} isAdmin={isAdmin} isPending={updateMutation.isPending} onUpdate={(status) => updateMutation.mutate({ id: request.id, status })} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function RequestRow({ request, isAdmin, isPending, onUpdate }: { request: ResourceRequest; isAdmin: boolean; isPending: boolean; onUpdate: (status: Extract<RequestStatus, "approved" | "fulfilled" | "rejected">) => void }) {
  const actionable = isAdmin && (request.status === "pending" || request.status === "approved");
  return (
    <TableRow>
      <TableCell className="font-medium">{request.ngo}</TableCell>
      <TableCell>{request.itemName}<div className="text-xs text-muted-foreground">{request.beneficiaries} beneficiaries</div></TableCell>
      <TableCell>{request.quantityKg} kg</TableCell>
      <TableCell className="text-muted-foreground">{new Date(request.neededBy).toLocaleDateString()}</TableCell>
      <TableCell><Badge variant="outline" className={`capitalize ${statusClass(request.status)}`}>{request.status}</Badge></TableCell>
      <TableCell className="text-right">
        {actionable ? <div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => onUpdate("rejected")} disabled={isPending}><X className="size-3.5" />Reject</Button><Button size="sm" onClick={() => onUpdate("fulfilled")} disabled={isPending}><Check className="size-3.5" />Fulfill</Button></div> : <span className="text-xs text-muted-foreground">{request.fulfilledAt ? `Fulfilled ${new Date(request.fulfilledAt).toLocaleDateString()}` : "Awaiting review"}</span>}
      </TableCell>
    </TableRow>
  );
}