import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Brain, Map as MapIcon, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResourceTwin — Donation & Distribution Twin" },
      { name: "description", content: "Optimize restaurant-to-NGO food donation and distribution with a digital twin: real-time inventory, AI prediction, map tracking." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <Sparkles className="size-4" />
            </div>
            <span className="font-semibold">ResourceTwin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-wider text-primary font-medium">
            Digital twin · Restaurant ⇄ NGO
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Move food from surplus to need, in real time.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            ResourceTwin simulates and optimizes your donation and distribution
            workflow. Track inventory, predict demand with AI, and route
            volunteers — all in one operational dashboard.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg">
              <Link to="/login">
                Open the dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/register">Create an account</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {[
            { icon: Brain, title: "AI demand prediction", body: "Forecast tomorrow's need by category and route inventory before it expires." },
            { icon: MapIcon, title: "Live map tracking", body: "See restaurants, NGOs, warehouses, and volunteers on one Google Map." },
            { icon: ShieldCheck, title: "Role-based access", body: "Separate dashboards for admins, NGOs, and volunteers — secured with JWT." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border p-5 bg-card">
              <f.icon className="size-5 text-primary" />
              <div className="mt-3 font-medium">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
