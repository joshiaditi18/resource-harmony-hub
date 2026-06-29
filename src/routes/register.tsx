import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { UserRole } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register · ResourceTwin" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("volunteer");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Join as Admin, NGO, or Volunteer.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating…" : "Create account"}
            </Button>
          </form>
          <div className="mt-5 text-sm text-muted-foreground text-center">
            Have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
