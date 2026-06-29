import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, AlertTriangle, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications · ResourceTwin" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: endpoints.notifications });
  const mut = useMutation({
    mutationFn: (id: string) => endpoints.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const visible = data?.filter((n) => !user || n.audience.includes(user.role));

  return (
    <AppShell title="Notifications">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="size-4" />Alerts for your role</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {visible?.length === 0 && <li className="py-6 text-sm text-muted-foreground">All caught up.</li>}
            {visible?.map((n) => {
              const Icon = n.level === "info" ? Info : AlertTriangle;
              const color = n.level === "critical" ? "text-rose-500" : n.level === "warn" ? "text-amber-500" : "text-sky-500";
              return (
                <li key={n.id} className="py-3 flex items-start gap-3">
                  <Icon className={`size-4 mt-0.5 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && (
                    <Button size="sm" variant="outline" onClick={() => mut.mutate(n.id)}>Mark read</Button>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}
