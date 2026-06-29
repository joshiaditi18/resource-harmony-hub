import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { HandCoins, Users, Recycle, MessageSquare, AlertTriangle, Brain } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · ResourceTwin" }] }),
  component: DashboardPage,
});

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#06b6d4", "#ec4899"];

function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ["dashboard"], queryFn: endpoints.dashboard });
  const { data: pred } = useQuery({ queryKey: ["prediction"], queryFn: endpoints.prediction });

  const kpis = [
    { label: "Total donations", value: stats?.totalDonations ?? "—", icon: HandCoins, accent: "text-emerald-500" },
    { label: "Active NGOs", value: stats?.activeNgos ?? "—", icon: Users, accent: "text-indigo-500" },
    { label: "Food waste reduced (kg)", value: stats?.foodWasteReducedKg?.toLocaleString() ?? "—", icon: Recycle, accent: "text-amber-500" },
    { label: "Pending requests", value: stats?.pendingRequests ?? "—", icon: MessageSquare, accent: "text-rose-500" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{k.label}</div>
                  <div className="mt-2 text-2xl font-semibold">{k.value}</div>
                </div>
                <k.icon className={`size-5 ${k.accent}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Donations vs Distribution (last 14 days)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.flow ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="donations" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="distribution" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resource distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.distributionByCategory ?? []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {(stats?.distributionByCategory ?? []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="size-4 text-primary" />AI prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Predicted need (next {pred?.windowDays ?? 7} days)</div>
            <div className="text-3xl font-semibold mt-1">{pred?.predictedDemandKg?.toLocaleString() ?? "—"} kg</div>
            <div className="text-xs text-muted-foreground mt-1">
              Confidence {((pred?.confidence ?? 0) * 100).toFixed(0)}%
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {pred?.byCategory.slice(0, 4).map((c) => (
                <li key={c.name} className="flex justify-between">
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="font-medium">{c.value} kg</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stats?.recentActivity.map((a) => (
                <li key={a.id} className="text-sm">
                  <div>{a.message}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-amber-500" />Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats?.alerts.map((a) => (
                <li key={a.id} className="text-sm flex items-start gap-2">
                  <span className={
                    a.level === "critical" ? "size-2 rounded-full bg-rose-500 mt-1.5"
                    : a.level === "warn" ? "size-2 rounded-full bg-amber-500 mt-1.5"
                    : "size-2 rounded-full bg-sky-500 mt-1.5"
                  } />
                  <span>{a.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
