import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users · ResourceTwin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { data } = useQuery({ queryKey: ["users"], queryFn: endpoints.listUsers });
  return (
    <AppShell title="Users">
      <Card>
        <CardHeader><CardTitle>All users</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Organization</TableHead><TableHead>Joined</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {data?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{u.organization ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
