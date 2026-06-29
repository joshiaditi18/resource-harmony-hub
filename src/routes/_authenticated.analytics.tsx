import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics · ResourceTwin" }] }),
  component: AnalyticsPage,
});

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#06b6d4", "#ec4899"];

function AnalyticsPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: endpoints.dashboard });

  return (
    <AppShell title="Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Donations vs Distribution</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.flow ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="donations" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="distribution" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Category mix</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.distributionByCategory ?? []} dataKey="value" nameKey="name" outerRadius={110} label>
                  {(data?.distributionByCategory ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
