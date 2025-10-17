import { http } from "./httpClient";

const base = "/api/warranty-claims";

// Helper: safe string
const toStringSafe = (v) => (v === undefined || v === null ? "" : String(v));

// Generate fallback code when BE doesn't provide one
const generateClaimCode = (id) => (id ? `CLM-${id}` : undefined);

// Mock-enrichment based on current UML to avoid empty UI while BE updates
const normalizeClaim = (raw) => {
  if (!raw || typeof raw !== "object") return {};
  const id = raw.id ?? raw.warrantyClaimId ?? raw.claimId;

  const vehicle = raw.vehicle || {};
  const customer = raw.customer || vehicle.customer || {};

  const priority = raw.priority || raw.claimPriority || "MEDIUM";
  const createdAt = raw.createdAt || raw.claimDate || new Date().toISOString();
  const status = raw.status || raw.claimStatus || "SUBMITTED";

  const code =
    raw.code || raw.claimCode || raw.claimNumber || generateClaimCode(id);

  const vehicleName =
    raw.vehicleName || vehicle.vehicleName || vehicle.brand || vehicle.make;
  const vehicleModel =
    raw.vehicleModel || vehicle.vehicleModel || vehicle.model;
  const vehicleYear = raw.vehicleYear || vehicle.vehicleYear || vehicle.year;
  const vehicleVin = raw.vehicleVin || vehicle.vehicleVin || vehicle.vin;

  const partName =
    raw.partName || raw.part || (raw.part?.partName ?? undefined);
  const partNumber = raw.partNumber || (raw.part?.partNumber ?? undefined);
  const partId = raw.partId || (raw.part?.partId ?? undefined);

  const customerName =
    raw.customerName || customer.name || vehicle.customerName || undefined;
  const customerEmail =
    raw.customerEmail || customer.email || vehicle.customerEmail || "";
  const customerPhone =
    raw.customerPhone || customer.phone || vehicle.customerPhone || "";
  const customerAddress =
    raw.customerAddress || customer.address || vehicle.customerAddress || "";

  return {
    ...raw,
    id,
    code,
    createdAt,
    status,
    priority,
    estimatedCost: raw.estimatedCost ?? raw.cost ?? null,
    description: raw.description || raw.issueDescription || "",
    // part
    partId,
    partName,
    partNumber,
    // vehicle
    vehicleId: raw.vehicleId ?? vehicle.vehicleId ?? vehicle.id,
    vehicleVin,
    vehicleName,
    vehicleModel,
    vehicleYear,
    // customer
    customerId:
      raw.customerId || customer.customerId || vehicle.customerId || undefined,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
  };
};

const normalizeListOrPage = (data) => {
  if (Array.isArray(data)) return data.map(normalizeClaim);
  if (Array.isArray(data?.content)) {
    return {
      ...data,
      content: data.content.map(normalizeClaim),
    };
  }
  return data;
};

export const warrantyClaimsApi = {
  list: async ({ page, size } = {}) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.set("page", page);
    if (size !== undefined) params.set("size", size);
    const { data } = await http.get(
      `${base}${params.toString() ? `?${params}` : ""}`
    );
    return normalizeListOrPage(data);
  },
  getById: async (id) => {
    const { data } = await http.get(`${base}/${id}`);
    return normalizeClaim(data);
  },
  create: async (payload) => {
    const { data } = await http.post(base, payload);
    return normalizeClaim(data);
  },
  update: async (id, payload) => {
    const { data } = await http.put(`${base}/${id}`, payload);
    return normalizeClaim(data);
  },
  delete: async (id) => {
    const { data } = await http.delete(`${base}/${id}`);
    return data;
  },
  updateStatus: async (id, status) => {
    // per Swagger: PATCH /api/warranty-claims/{id}/status with body { status, comments?, updatedBy? }
    const { data } = await http.patch(`${base}/${id}/status`, { status });
    return normalizeClaim(data);
  },
};
