// Centralized mock lookup service with API fallback and simple in-memory cache

const cache = {
  serviceCenters: null,
  technicians: null,
  parts: null,
};

export async function getServiceCenters() {
  if (cache.serviceCenters) return cache.serviceCenters;
  // Mock data; replace with API when BE is ready
  cache.serviceCenters = [
    { id: 1, name: "Trung tâm dịch vụ Hà Nội", address: "123 Đường ABC, Hà Nội" },
    { id: 2, name: "Trung tâm dịch vụ TP.HCM", address: "456 Đường XYZ, TP.HCM" },
    { id: 3, name: "Trung tâm dịch vụ Đà Nẵng", address: "789 Đường DEF, Đà Nẵng" },
  ];
  return cache.serviceCenters;
}

export async function getTechnicians() {
  if (cache.technicians) return cache.technicians;
  cache.technicians = [
    { id: 1, name: "Nguyễn Văn A", email: "tech1@example.com", serviceCenterId: 1 },
    { id: 2, name: "Trần Thị B", email: "tech2@example.com", serviceCenterId: 1 },
    { id: 3, name: "Lê Văn C", email: "tech3@example.com", serviceCenterId: 2 },
    { id: 4, name: "Phạm Thị D", email: "tech4@example.com", serviceCenterId: 3 },
  ];
  return cache.technicians;
}

export async function getParts() {
  if (cache.parts) return cache.parts;
  try {
    const API_BASE = "https://backend.bluecloudk.xyz";
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE}/api/parts?page=0&size=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });
    if (res.ok) {
      const data = await res.json();
      cache.parts = Array.isArray(data?.content) ? data.content : [];
      return cache.parts;
    }
  } catch (_) {}
  cache.parts = [
    { partId: "BAT-001", partName: "Battery Pack", partNumber: "BAT-001", price: 1000000 },
    { partId: "MOT-002", partName: "Electric Motor", partNumber: "MOT-002", price: 2500000 },
    { partId: "CHG-003", partName: "Charging Port", partNumber: "CHG-003", price: 500000 },
    { partId: "CTR-004", partName: "Controller Unit", partNumber: "CTR-004", price: 800000 },
    { partId: "BRK-005", partName: "Brake System", partNumber: "BRK-005", price: 1200000 },
  ];
  return cache.parts;
}


