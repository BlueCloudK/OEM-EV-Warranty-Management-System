import { http } from "./httpClient";

const base = "/api/service-histories";

const normalizeHistory = (raw) => {
  if (!raw || typeof raw !== "object") return {};
  const vehicle = raw.vehicle || {};
  const customer = raw.customer || vehicle.customer || {};
  return {
    ...raw,
    id: raw.id ?? raw.serviceHistoryId,
    vehicleVin: raw.vehicleVin || vehicle.vehicleVin || vehicle.vin,
    customerName: raw.customerName || customer.name || vehicle.customerName,
    customerPhone: raw.customerPhone || customer.phone || "",
    serviceType: raw.serviceType || "MAINTENANCE",
    description: raw.description || "",
    serviceDate: raw.serviceDate || raw.createdAt || new Date().toISOString(),
    serviceCenter: raw.serviceCenter || raw.center || "",
    technician: raw.technician || "",
    partsUsed: raw.partsUsed || "",
    laborHours: raw.laborHours ?? null,
    totalCost: raw.totalCost ?? null,
    status: raw.status || "COMPLETED",
    notes: raw.notes || "",
    nextServiceDate: raw.nextServiceDate || null,
    mileage: raw.mileage ?? null,
    warrantyInfo: raw.warrantyInfo || "",
    createdAt: raw.createdAt || raw.serviceDate,
  };
};

const normalizeListOrPage = (data) => {
  if (Array.isArray(data)) return data.map(normalizeHistory);
  if (Array.isArray(data?.content)) {
    return { ...data, content: data.content.map(normalizeHistory) };
  }
  return data;
};

export const serviceHistoriesApi = {
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
    return normalizeHistory(data);
  },
  create: async (payload) => {
    const { data } = await http.post(base, payload);
    return normalizeHistory(data);
  },
  update: async (id, payload) => {
    const { data } = await http.put(`${base}/${id}`, payload);
    return normalizeHistory(data);
  },
  delete: async (id) => {
    const { data } = await http.delete(`${base}/${id}`);
    return data;
  },
};
