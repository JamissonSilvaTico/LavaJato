
export type Page = 'dashboard' | 'customers' | 'work-orders' | 'services' | 'inventory' | 'finance' | 'settings';
export type UserRole = 'admin' | 'funcionario';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  birthday: string; // YYYY-MM-DD
  vehicles: Vehicle[];
  serviceHistory: WorkOrder[];
}

export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  color: string;
  observations?: string;
}

export interface Product {
  id: number;
  name: string;
  supplier: string;
  cost: number;
  stock: number;
  minStock: number;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  productsConsumed: { productId: number; quantity: number }[];
}

export enum WorkOrderStatus {
  Waiting = 'Aguardando',
  InProgress = 'Em Andamento',
  Finished = 'Finalizado',
  Delivered = 'Entregue',
}

export interface WorkOrder {
  id: number;
  customerId: number;
  vehicleId: number;
  services: Service[];
  employee?: string;
  status: WorkOrderStatus;
  checkinTime: string; // ISO 8601
  checkoutTime?: string; // ISO 8601
  damageLog?: string;
  total: number;
  isPaid: boolean;
  paymentMethod?: 'pix' | 'credit' | 'debit' | 'cash';
}

export interface Expense {
  id: number;
  description: string;
  category: 'Produtos' | 'Salários' | 'Aluguel' | 'Marketing' | 'Outros';
  amount: number;
  date: string; // YYYY-MM-DD
}
