import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Brain } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/prediction")({
  head: () => ({ meta: [{ title: "AI Prediction · ResourceTwin" }] }),
  component: PredictionPage,
});

function PredictionPage() {
  const { data } = useQuery({ queryKey: ["prediction"], queryFn: endpoints.prediction });

  return (
    <AppShell title="AI Demand Prediction">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="size-4 text-primary" />Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Next {data?.windowDays ?? 7} days</div>
            <div className="text-4xl font-semibold mt-1">{data?.predictedDemandKg?.toLocaleString() ?? "—"} kg</div>
            <div className="text-xs text-muted-foreground mt-1">Model confidence {((data?.confidence ?? 0) * 100).toFixed(0)}%</div>
            <ul className="mt-6 space-y-2">
              {data?.byCategory.map((c) => (
                <li key={c.name} className="text-sm flex items-center justify-between">
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="font-medium">{c.value} kg</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Predicted vs Actual demand</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend ?? []}>
                <defs>
                  <linearGradient id="pred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="predicted" stroke="#6366f1" fill="url(#pred)" />
                <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
