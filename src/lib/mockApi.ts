/**
 * In-memory mock for the Flask API. Activated automatically when
 * VITE_API_BASE_URL is empty. Mirrors the endpoint shape in api.ts so swapping
 * to the real backend is a one-line env change.
 */
import type {
  ApiOptions,
} from "./api";
import type {
  AuthUser,
  DashboardStats,
  Distribution,
  Donation,
  InventoryItem,
  MapLocation,
  Notification,
  PredictionResult,
  ResourceRequest,
  UserRole,
} from "./api";

const now = () => new Date().toISOString();
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const daysAhead = (n: number) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

const users: AuthUser[] = [
  { id: "u1", name: "Admin", email: "admin@demo.io", role: "admin", createdAt: daysAgo(120) },
  { id: "u2", name: "Helping Hands NGO", email: "ngo@demo.io", role: "ngo", organization: "Helping Hands", createdAt: daysAgo(90) },
  { id: "u3", name: "Volunteer Riya", email: "volunteer@demo.io", role: "volunteer", createdAt: daysAgo(40) },
  { id: "u4", name: "Anna Daan NGO", email: "anna@demo.io", role: "ngo", organization: "Anna Daan", createdAt: daysAgo(60) },
];

const inventory: InventoryItem[] = [
  { id: "i1", name: "Rice", category: "grain", quantityKg: 420, threshold: 150, expiresAt: daysAhead(30), location: "Warehouse A", status: "ok" },
  { id: "i2", name: "Wheat Flour", category: "grain", quantityKg: 90, threshold: 120, expiresAt: daysAhead(20), location: "Warehouse A", status: "low" },
  { id: "i3", name: "Cooked Dal", category: "prepared", quantityKg: 35, threshold: 40, expiresAt: daysAhead(1), location: "Kitchen 2", status: "expiring" },
  { id: "i4", name: "Tomatoes", category: "vegetable", quantityKg: 60, threshold: 30, expiresAt: daysAhead(4), location: "Cold Room", status: "ok" },
  { id: "i5", name: "Milk", category: "dairy", quantityKg: 0, threshold: 20, expiresAt: daysAhead(2), location: "Cold Room", status: "out" },
  { id: "i6", name: "Chapati", category: "prepared", quantityKg: 110, threshold: 50, expiresAt: daysAhead(1), location: "Kitchen 1", status: "ok" },
];

const donations: Donation[] = [
  { id: "d1", donor: "Spice Garden Restaurant", itemName: "Cooked Rice", quantityKg: 25, receivedAt: daysAgo(0), status: "received" },
  { id: "d2", donor: "Hotel Marigold", itemName: "Mixed Curry", quantityKg: 18, receivedAt: daysAgo(1), status: "received" },
  { id: "d3", donor: "Fresh Mart", itemName: "Vegetables", quantityKg: 42, receivedAt: daysAgo(2), status: "received" },
  { id: "d4", donor: "Cafe Aroma", itemName: "Bread", quantityKg: 12, receivedAt: daysAgo(0), status: "in_transit" },
];

const distributions: Distribution[] = [
  { id: "x1", ngo: "Helping Hands", itemName: "Rice + Dal", quantityKg: 60, distributedAt: daysAgo(0), beneficiaries: 120, status: "completed" },
  { id: "x2", ngo: "Anna Daan", itemName: "Chapati + Sabzi", quantityKg: 45, distributedAt: daysAgo(1), beneficiaries: 90, status: "completed" },
  { id: "x3", ngo: "Smile Foundation", itemName: "Khichdi", quantityKg: 30, distributedAt: daysAhead(0), beneficiaries: 70, status: "in_progress" },
];

const requests: ResourceRequest[] = [
  {
    id: "r1",
    ngo: "Smile Foundation",
    itemName: "Grain",
    quantityKg: 50,
    beneficiaries: 100,
    requestedAt: daysAgo(1),
    neededBy: daysAhead(2),
    status: "pending",
    notes: "Weekly community meal service",
  },
  {
    id: "r2",
    ngo: "Helping Hands",
    itemName: "Rice + Dal",
    quantityKg: 60,
    beneficiaries: 120,
    requestedAt: daysAgo(3),
    neededBy: daysAgo(1),
    status: "fulfilled",
    fulfilledAt: daysAgo(0),
    distributionId: "x1",
  },
];

const locations: MapLocation[] = [
  { id: "l1", name: "Spice Garden Restaurant", type: "restaurant", lat: 19.076, lng: 72.8777, status: "active" },
  { id: "l2", name: "Hotel Marigold", type: "restaurant", lat: 19.09, lng: 72.86, status: "active" },
  { id: "l3", name: "Helping Hands NGO", type: "ngo", lat: 19.06, lng: 72.85, status: "active" },
  { id: "l4", name: "Anna Daan NGO", type: "ngo", lat: 19.1, lng: 72.89, status: "active" },
  { id: "l5", name: "Central Warehouse", type: "warehouse", lat: 19.08, lng: 72.87, status: "active" },
  { id: "l6", name: "Volunteer Riya", type: "volunteer", lat: 19.07, lng: 72.88, status: "en_route" },
];

const notifications: Notification[] = [
  { id: "n1", level: "critical", title: "Milk out of stock", message: "Replenish Milk in Cold Room.", createdAt: daysAgo(0), read: false, audience: ["admin"] },
  { id: "n2", level: "warn", title: "Wheat Flour low", message: "Below threshold (90/120 kg).", createdAt: daysAgo(0), read: false, audience: ["admin", "ngo"] },
  { id: "n3", level: "info", title: "New donation received", message: "Spice Garden donated 25 kg cooked rice.", createdAt: daysAgo(0), read: true, audience: ["admin", "volunteer"] },
  { id: "n4", level: "warn", title: "Urgent request", message: "Smile Foundation needs 50 kg of grain.", createdAt: daysAgo(1), read: false, audience: ["ngo", "admin"] },
];

function dashboard(): DashboardStats {
  const flow = Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(5, 10),
    donations: 80 + Math.round(Math.sin(i / 2) * 30 + Math.random() * 25),
    distribution: 60 + Math.round(Math.cos(i / 2) * 25 + Math.random() * 25),
  }));
  return {
    totalDonations: 1284,
    activeNgos: 23,
    foodWasteReducedKg: 8420,
    pendingRequests: requests.filter((request) => request.status === "pending" || request.status === "approved").length,
    flow,
    distributionByCategory: [
      { name: "Grain", value: 38 },
      { name: "Prepared", value: 27 },
      { name: "Vegetable", value: 18 },
      { name: "Dairy", value: 10 },
      { name: "Other", value: 7 },
    ],
    recentActivity: [
      ...requests.slice(0, 2).map((request) => ({
        id: request.id,
        kind: "request",
        message: `${request.ngo} ${request.status} ${request.quantityKg} kg of ${request.itemName}`,
        at: request.fulfilledAt ?? request.requestedAt,
      })),
      { id: "a1", kind: "donation", message: "Spice Garden donated 25 kg cooked rice", at: daysAgo(0) },
      { id: "a2", kind: "distribution", message: "Helping Hands distributed 60 kg to 120 beneficiaries", at: daysAgo(0) },
      { id: "a3", kind: "volunteer", message: "Volunteer Riya signed up", at: daysAgo(1) },
      { id: "a4", kind: "donation", message: "Fresh Mart donated 42 kg vegetables", at: daysAgo(2) },
    ],
    alerts: [
      { id: "al1", level: "critical", message: "Milk out of stock in Cold Room" },
      { id: "al2", level: "warn", message: "Wheat Flour below threshold" },
      { id: "al3", level: "info", message: "Smile Foundation requesting 50 kg grain" },
    ],
  };
}

function prediction(): PredictionResult {
  const trend = Array.from({ length: 14 }).map((_, i) => {
    const base = 1200 + i * 18 + Math.sin(i / 2) * 60;
    return {
      date: new Date(Date.now() + (i - 7) * 86400000).toISOString().slice(5, 10),
      predicted: Math.round(base),
      actual: i < 7 ? Math.round(base + (Math.random() - 0.5) * 100) : undefined,
    };
  });
  return {
    predictedDemandKg: 1523,
    windowDays: 7,
    confidence: 0.87,
    byCategory: [
      { name: "Grain", value: 580 },
      { name: "Prepared", value: 420 },
      { name: "Vegetable", value: 260 },
      { name: "Dairy", value: 160 },
      { name: "Other", value: 103 },
    ],
    trend,
  };
}

const delay = <T>(value: T, ms = 250) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

function match(path: string, pattern: RegExp): RegExpMatchArray | null {
  return path.match(pattern);
}

export async function mockApi<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const body = (opts.body ?? {}) as Record<string, unknown>;
  const p = path.replace(/\/+$/, "");

  // Auth
  if (p === "/auth/login" && method === "POST") {
    const email = String(body.email ?? "").toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    return delay({ token: `mock.${user.id}.${Date.now()}`, user } as unknown as T);
  }
  if (p === "/auth/register" && method === "POST") {
    const u: AuthUser = {
      id: `u${users.length + 1}`,
      name: String(body.name ?? "New User"),
      email: String(body.email ?? "new@demo.io"),
      role: (body.role as UserRole) ?? "volunteer",
      createdAt: now(),
    };
    users.push(u);
    return delay({ token: `mock.${u.id}.${Date.now()}`, user: u } as unknown as T);
  }
  if (p === "/auth/me") {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth.token") : null;
    const id = token?.split(".")[1];
    const user = users.find((u) => u.id === id) ?? users[0];
    return delay(user as unknown as T);
  }

  // Inventory
  if (p === "/inventory" && method === "GET") return delay(inventory as unknown as T);
  if (p === "/inventory" && method === "POST") {
    const item: InventoryItem = {
      id: `i${inventory.length + 1}`,
      name: String(body.name ?? "Item"),
      category: (body.category as InventoryItem["category"]) ?? "other",
      quantityKg: Number(body.quantityKg ?? 0),
      threshold: Number(body.threshold ?? 0),
      expiresAt: String(body.expiresAt ?? daysAhead(7)),
      location: String(body.location ?? "Warehouse A"),
      status: "ok",
    };
    inventory.unshift(item);
    return delay(item as unknown as T);
  }
  const invId = match(p, /^\/inventory\/([^/]+)$/);
  if (invId && method === "PUT") {
    const idx = inventory.findIndex((i) => i.id === invId[1]);
    if (idx >= 0) inventory[idx] = { ...inventory[idx], ...(body as Partial<InventoryItem>) };
    return delay(inventory[idx] as unknown as T);
  }
  if (invId && method === "DELETE") {
    const idx = inventory.findIndex((i) => i.id === invId[1]);
    if (idx >= 0) inventory.splice(idx, 1);
    return delay(undefined as unknown as T);
  }

  // Donations
  if (p === "/donations" && method === "GET") return delay(donations as unknown as T);
  if (p === "/donations" && method === "POST") {
    const d: Donation = {
      id: `d${donations.length + 1}`,
      donor: String(body.donor ?? "Anonymous"),
      itemName: String(body.itemName ?? "Food"),
      quantityKg: Number(body.quantityKg ?? 0),
      receivedAt: now(),
      status: "received",
    };
    donations.unshift(d);
    return delay(d as unknown as T);
  }

  // Distributions
  if (p === "/distributions" && method === "GET") return delay(distributions as unknown as T);
  if (p === "/distributions" && method === "POST") {
    const d: Distribution = {
      id: `x${distributions.length + 1}`,
      ngo: String(body.ngo ?? "NGO"),
      itemName: String(body.itemName ?? "Food"),
      quantityKg: Number(body.quantityKg ?? 0),
      distributedAt: now(),
      beneficiaries: Number(body.beneficiaries ?? 0),
      status: "scheduled",
    };
    distributions.unshift(d);
    return delay(d as unknown as T);
  }

  // Resource requests. Fulfillment is intentionally one atomic API action:
  // the real Flask service should update the request, inventory, distribution,
  // and notification in the same database transaction.
  if (p === "/requests" && method === "GET") return delay(requests as unknown as T);
  if (p === "/requests" && method === "POST") {
    const request: ResourceRequest = {
      id: `r${requests.length + 1}`,
      ngo: String(body.ngo ?? "My organization"),
      itemName: String(body.itemName ?? "Food"),
      quantityKg: Number(body.quantityKg ?? 0),
      beneficiaries: Number(body.beneficiaries ?? 0),
      requestedAt: now(),
      neededBy: String(body.neededBy ?? daysAhead(2)),
      status: "pending",
      notes: body.notes ? String(body.notes) : undefined,
    };
    requests.unshift(request);
    notifications.unshift({
      id: `n${notifications.length + 1}`,
      level: "info",
      title: "New resource request",
      message: `${request.ngo} asked for ${request.quantityKg} kg of ${request.itemName}.`,
      createdAt: now(),
      read: false,
      audience: ["admin"],
    });
    return delay(request as unknown as T);
  }
  const requestId = match(p, /^\/requests\/([^/]+)$/);
  if (requestId && method === "PATCH") {
    const request = requests.find((item) => item.id === requestId[1]);
    if (!request) throw Object.assign(new Error("Request not found"), { status: 404 });
    const nextStatus = body.status as ResourceRequest["status"];
    if (!["approved", "fulfilled", "rejected"].includes(nextStatus)) {
      throw Object.assign(new Error("Invalid request status"), { status: 400 });
    }
    if (nextStatus === "fulfilled" && request.status !== "fulfilled") {
      const matchingInventory = inventory.find((item) =>
        item.name.toLowerCase().includes(request.itemName.toLowerCase()) ||
        request.itemName.toLowerCase().includes(item.category),
      );
      if (!matchingInventory || matchingInventory.quantityKg < request.quantityKg) {
        throw Object.assign(new Error("Not enough inventory to fulfill this request"), { status: 409 });
      }
      matchingInventory.quantityKg -= request.quantityKg;
      matchingInventory.status = matchingInventory.quantityKg === 0
        ? "out"
        : matchingInventory.quantityKg <= matchingInventory.threshold
          ? "low"
          : "ok";
      const distribution: Distribution = {
        id: `x${distributions.length + 1}`,
        ngo: request.ngo,
        itemName: request.itemName,
        quantityKg: request.quantityKg,
        distributedAt: now(),
        beneficiaries: request.beneficiaries,
        status: "completed",
      };
      distributions.unshift(distribution);
      request.distributionId = distribution.id;
      request.fulfilledAt = now();
    }
    request.status = nextStatus;
    return delay(request as unknown as T);
  }

  // Analytics
  if (p === "/analytics/dashboard") return delay(dashboard() as unknown as T);
  if (p === "/analytics/prediction") return delay(prediction() as unknown as T);

  // Map
  if (p === "/map/locations") return delay(locations as unknown as T);

  // Notifications
  if (p === "/notifications") return delay(notifications as unknown as T);
  const noteId = match(p, /^\/notifications\/([^/]+)\/read$/);
  if (noteId && method === "POST") {
    const n = notifications.find((x) => x.id === noteId[1]);
    if (n) n.read = true;
    return delay(undefined as unknown as T);
  }

  // Users
  if (p === "/users" && method === "GET") return delay(users as unknown as T);

  throw Object.assign(new Error(`Mock route not implemented: ${method} ${p}`), { status: 404 });
}
