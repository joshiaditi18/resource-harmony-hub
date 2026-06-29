import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Store, HeartHandshake, Warehouse, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { endpoints, type MapLocation } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({ meta: [{ title: "Map tracking · ResourceTwin" }] }),
  component: MapPage,
});

const ICONS: Record<MapLocation["type"], React.ComponentType<{ className?: string }>> = {
  restaurant: Store, ngo: HeartHandshake, warehouse: Warehouse, volunteer: User,
};

const COLORS: Record<MapLocation["type"], string> = {
  restaurant: "text-indigo-500",
  ngo: "text-emerald-500",
  warehouse: "text-amber-500",
  volunteer: "text-rose-500",
};

function MapPage() {
  const { data } = useQuery({ queryKey: ["locations"], queryFn: endpoints.locations });
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  const center = data?.[0] ? `${data[0].lat},${data[0].lng}` : "19.076,72.8777";
  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center}&zoom=12`
    : `https://www.google.com/maps?q=${center}&z=12&output=embed`;

  return (
    <AppShell title="Map Tracking">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Live network</CardTitle></CardHeader>
          <CardContent>
            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-border">
              <iframe
                title="Map"
                src={mapSrc}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {!apiKey && (
              <p className="mt-3 text-xs text-muted-foreground">
                Set <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable the official Google Maps Embed API.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Locations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data?.map((loc) => {
                const Icon = ICONS[loc.type];
                return (
                  <li key={loc.id} className="flex items-start gap-3">
                    <Icon className={`size-4 mt-0.5 ${COLORS[loc.type]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{loc.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {loc.type} · {loc.status.replace("_", " ")}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3" /> {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
