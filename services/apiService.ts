import {
  Customer,
  Expense,
  Product,
  Service,
  WorkOrder,
  Vehicle,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API_URL = `${API_BASE_URL}/api`;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }
  // Handle cases with no content
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return;
};

const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  return handleResponse(response);
};

// --- CRUD Functions ---

// Customers
export const getCustomers = () =>
  apiRequest<Customer[]>(`${API_URL}/customers`);
export const addCustomer = (
  data: Omit<Customer, "id" | "vehicles" | "serviceHistory"> & {
    vehicles: Omit<Vehicle, "id">[];
  }
) =>
  apiRequest<Customer>(`${API_URL}/customers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateCustomer = (id: number, data: Partial<Customer>) =>
  apiRequest<Customer>(`${API_URL}/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteCustomer = (id: number) =>
  apiRequest<void>(`${API_URL}/customers/${id}`, { method: "DELETE" });

// Products
export const getProducts = () => apiRequest<Product[]>(`${API_URL}/products`);
export const addProduct = (data: Omit<Product, "id">) =>
  apiRequest<Product>(`${API_URL}/products`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateProduct = (id: number, data: Partial<Product>) =>
  apiRequest<Product>(`${API_URL}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteProduct = (id: number) =>
  apiRequest<void>(`${API_URL}/products/${id}`, { method: "DELETE" });

// Services
export const getServices = () => apiRequest<Service[]>(`${API_URL}/services`);
export const addService = (data: Omit<Service, "id">) =>
  apiRequest<Service>(`${API_URL}/services`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateService = (id: number, data: Partial<Service>) =>
  apiRequest<Service>(`${API_URL}/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteService = (id: number) =>
  apiRequest<void>(`${API_URL}/services/${id}`, { method: "DELETE" });

// Work Orders
export const getWorkOrders = () =>
  apiRequest<WorkOrder[]>(`${API_URL}/work-orders`);
export const addWorkOrder = (data: Omit<WorkOrder, "id">) =>
  apiRequest<WorkOrder>(`${API_URL}/work-orders`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateWorkOrder = (id: number, data: Partial<WorkOrder>) =>
  apiRequest<WorkOrder>(`${API_URL}/work-orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteWorkOrder = (id: number) =>
  apiRequest<void>(`${API_URL}/work-orders/${id}`, { method: "DELETE" });

// Expenses
export const getExpenses = () => apiRequest<Expense[]>(`${API_URL}/expenses`);
export const addExpense = (data: Omit<Expense, "id">) =>
  apiRequest<Expense>(`${API_URL}/expenses`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateExpense = (id: number, data: Partial<Expense>) =>
  apiRequest<Expense>(`${API_URL}/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteExpense = (id: number) =>
  apiRequest<void>(`${API_URL}/expenses/${id}`, { method: "DELETE" });

// --- Aggregated Data ---

export const getDashboardData = () =>
  apiRequest<any>(`${API_URL}/dashboard/stats`);
export const getFinancialChartData = () =>
  apiRequest<any>(`${API_URL}/dashboard/financial-chart`);

export const completeWorkOrder = (
  orderId: number,
  paymentMethod: "pix" | "credit" | "debit" | "cash"
) =>
  apiRequest<WorkOrder>(`${API_URL}/work-orders/${orderId}/complete`, {
    method: "POST",
    body: JSON.stringify({ paymentMethod }),
  });
