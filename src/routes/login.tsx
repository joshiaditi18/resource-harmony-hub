import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · ResourceTwin" }] }),
  component: LoginPage,
});

const DEMO = [
  { label: "Admin", email: "admin@demo.io" },
  { label: "NGO", email: "ngo@demo.io" },
  { label: "Volunteer", email: "volunteer@demo.io" },
];

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@demo.io");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message || "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold">ResourceTwin</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Access your role-specific dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <div className="mt-5 text-xs text-muted-foreground">
              Demo accounts:
              <div className="mt-2 flex flex-wrap gap-2">
                {DEMO.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => setEmail(d.email)}
                    className="px-2 py-1 rounded border border-border hover:bg-accent"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 text-sm text-muted-foreground text-center">
              No account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
