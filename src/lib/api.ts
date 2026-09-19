/**
 * Thin API client for the Flask backend.
 *
 * - Reads base URL from `VITE_API_BASE_URL`.
 * - If unset, falls back to local mock data (see ./mockApi.ts) so the UI
 *   stays usable until the backend is plugged in.
 * - JWT is read from localStorage under `auth.token` and sent as
 *   `Authorization: Bearer <token>`.
 */
import { mockApi } from "./mockApi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";
export const USING_MOCKS = BASE_URL === "";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth.token");
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path: string, query?: ApiOptions["query"]): string {
  const url = new URL(path.replace(/^\//, ""), BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/");
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  // Mock fallback: route to local handlers when no backend configured.
  if (USING_MOCKS) {
    return mockApi<T>(path, opts);
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = (data as { message?: string } | null)?.message || res.statusText;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Typed endpoint helpers — map 1:1 to Flask routes. */
export const endpoints = {
  // Auth
  login: (body: { email: string; password: string }) =>
    api<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body }),
  register: (body: { name: string; email: string; password: string; role: UserRole }) =>
    api<{ token: string; user: AuthUser }>("/auth/register", { method: "POST", body }),
  me: () => api<AuthUser>("/auth/me"),

  // Inventory
  listInventory: () => api<InventoryItem[]>("/inventory"),
  createInventory: (body: Partial<InventoryItem>) =>
    api<InventoryItem>("/inventory", { method: "POST", body }),
  updateInventory: (id: string, body: Partial<InventoryItem>) =>
    api<InventoryItem>(`/inventory/${id}`, { method: "PUT", body }),
  deleteInventory: (id: string) => api<void>(`/inventory/${id}`, { method: "DELETE" }),

  // Donations
  listDonations: () => api<Donation[]>("/donations"),
  createDonation: (body: Partial<Donation>) =>
    api<Donation>("/donations", { method: "POST", body }),

  // Distribution
  listDistributions: () => api<Distribution[]>("/distributions"),
  createDistribution: (body: Partial<Distribution>) =>
    api<Distribution>("/distributions", { method: "POST", body }),

  // Requests
  listRequests: () => api<ResourceRequest[]>("/requests"),
  createRequest: (body: CreateRequestInput) =>
    api<ResourceRequest>("/requests", { method: "POST", body }),
  updateRequest: (id: string, body: UpdateRequestInput) =>
    api<ResourceRequest>(`/requests/${id}`, { method: "PATCH", body }),

  // Analytics / dashboard
  dashboard: () => api<DashboardStats>("/analytics/dashboard"),
  prediction: () => api<PredictionResult>("/analytics/prediction"),

  // Map
  locations: () => api<MapLocation[]>("/map/locations"),

  // Notifications
  notifications: () => api<Notification[]>("/notifications"),
  markNotificationRead: (id: string) =>
    api<void>(`/notifications/${id}/read`, { method: "POST" }),

  // Users
  listUsers: () => api<AuthUser[]>("/users"),
};

// ──────────────────────────────────────────────────────────────────────────
// Shared types — keep in sync with the Flask Pydantic/marshmallow schemas.
// ──────────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "ngo" | "volunteer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "grain" | "vegetable" | "dairy" | "prepared" | "other";
  quantityKg: number;
  threshold: number;
  expiresAt: string;
  location: string;
  status: "ok" | "low" | "expiring" | "out";
}

export interface Donation {
  id: string;
  donor: string;
  itemName: string;
  quantityKg: number;
  receivedAt: string;
  status: "received" | "in_transit" | "scheduled";
}

export interface Distribution {
  id: string;
  ngo: string;
  itemName: string;
  quantityKg: number;
  distributedAt: string;
  beneficiaries: number;
  status: "completed" | "in_progress" | "scheduled";
}

export type RequestStatus = "pending" | "approved" | "fulfilled" | "rejected";

export interface ResourceRequest {
  id: string;
  ngo: string;
  itemName: string;
  quantityKg: number;
  beneficiaries: number;
  requestedAt: string;
  neededBy: string;
  status: RequestStatus;
  notes?: string;
  fulfilledAt?: string;
  distributionId?: string;
}

export interface CreateRequestInput {
  ngo?: string;
  itemName: string;
  quantityKg: number;
  beneficiaries: number;
  neededBy?: string;
  notes?: string;
}

export interface UpdateRequestInput {
  status: Extract<RequestStatus, "approved" | "fulfilled" | "rejected">;
}

export interface DashboardStats {
  totalDonations: number;
  activeNgos: number;
  foodWasteReducedKg: number;
  pendingRequests: number;
  flow: { date: string; donations: number; distribution: number }[];
  distributionByCategory: { name: string; value: number }[];
  recentActivity: { id: string; kind: string; message: string; at: string }[];
  alerts: { id: string; level: "info" | "warn" | "critical"; message: string }[];
}

export interface PredictionResult {
  predictedDemandKg: number;
  windowDays: number;
  confidence: number;
  byCategory: { name: string; value: number }[];
  trend: { date: string; predicted: number; actual?: number }[];
}

export interface MapLocation {
  id: string;
  name: string;
  type: "restaurant" | "ngo" | "warehouse" | "volunteer";
  lat: number;
  lng: number;
  status: string;
}

export interface Notification {
  id: string;
  level: "info" | "warn" | "critical";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  audience: UserRole[];
}
