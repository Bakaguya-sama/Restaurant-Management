// Clean ordering page API implementation (used to avoid corrupted file during fixes)

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export async function createOrder(orderData: any) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || `Failed to create order: ${res.status}`);
  return data.data || data;
}

export async function fetchTables(status?: string) {
  const url = new URL(`${API_BASE_URL}/tables`);
  if (status) url.searchParams.set("status", status);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch tables: ${res.status}`);
  const data = await res.json();
  return data.data || data;
}

export async function fetchOrderByTableId(tableId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/table/${tableId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch order: ${res.status}`);
  }
  const data = await res.json();
  return data.data && data.data.length > 0 ? data.data[0] : null;
}

export async function fetchOrderDetails(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/details`);
  if (!res.ok) throw new Error(`Failed to fetch order details: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export async function addItemToOrder(orderId: string, item: any) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.message || `Failed to add item to order: ${res.status}`
    );
  return data.data || data;
}

export default {
  createOrder,
  fetchTables,
  fetchOrderByTableId,
  fetchOrderDetails,
  addItemToOrder,
};
