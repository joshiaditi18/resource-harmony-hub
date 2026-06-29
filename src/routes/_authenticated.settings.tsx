import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { USING_MOCKS } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · ResourceTwin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const base = import.meta.env.VITE_API_BASE_URL || "(not set)";
  return (
    <AppShell title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Read-only preview.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={user?.name ?? ""} readOnly /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={user?.email ?? ""} readOnly /></div>
            <div className="space-y-1.5"><Label>Role</Label><Input value={user?.role ?? ""} readOnly /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backend connection</CardTitle>
            <CardDescription>Point the frontend at your Flask API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">VITE_API_BASE_URL</div>
              <div className="font-mono mt-1">{base}</div>
            </div>
            <div className="text-muted-foreground">
              Status:{" "}
              {USING_MOCKS ? (
                <span className="text-amber-600">Using local mock data</span>
              ) : (
                <span className="text-emerald-600">Connected to live backend</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground border-t border-border pt-3">
              Expected Flask routes:{" "}
              <code>/auth/login</code>, <code>/auth/register</code>, <code>/auth/me</code>,{" "}
              <code>/inventory</code>, <code>/donations</code>, <code>/distributions</code>,{" "}
              <code>/analytics/dashboard</code>, <code>/analytics/prediction</code>,{" "}
              <code>/map/locations</code>, <code>/notifications</code>, <code>/users</code>.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
