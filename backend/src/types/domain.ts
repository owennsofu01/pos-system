import { Role } from "./roles";

export interface Staff {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface StaffWithPasswordHash extends Staff {
  passwordHash: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  qty: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  points: number;
  visits: number;
  spend: number;
}

export type PaymentMethod = "cash" | "card" | "mobile_money";
export type TransactionStatus = "completed" | "refunded";

export interface TransactionLine {
  id?: number;
  productId: number | null;
  name: string;
  unitPrice: number;
  qty: number;
  isManual: boolean;
}

export interface Transaction {
  id: number;
  receiptNo: string;
  date: string;
  time: string;
  cashierId: number | null;
  cashierName: string;
  method: PaymentMethod;
  status: TransactionStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  changeDue: number;
  customerId: number | null;
  pointsEarned: number;
  lines: TransactionLine[];
}

export type InventoryLogType = "sale" | "purchase_return" | "adjustment";

export interface InventoryLogEntry {
  id: number;
  productId: number | null;
  productName: string;
  delta: number;
  type: InventoryLogType;
  reference: string;
  occurredAt: string;
}

export interface Settings {
  businessName: string;
  businessType: string;
  taxRate: number;
  currency: string;
  lowStockThreshold: number;
  pointsPerUnit: number;
  receiptFooter: string;
}

export type EmailSecurity = "None" | "TLS" | "SSL";

export interface EmailSettings {
  fromName: string;
  fromAddress: string;
  replyTo: string;
  host: string;
  port: number;
  username: string;
  security: EmailSecurity;
  subjectTemplate: string;
  autoSend: boolean;
}

export type ChannelKind = "channel" | "direct";

export interface Channel {
  id: string;
  name: string;
  kind: ChannelKind;
  memberCount: number;
  unread: number;
}

export interface ChatMessage {
  id: number;
  channelId: string;
  from: string;
  body: string;
  occurredAt: string;
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", space: false, quick: [20, 50, 100] },
  { code: "EUR", symbol: "€", space: false, quick: [20, 50, 100] },
  { code: "GBP", symbol: "£", space: false, quick: [20, 50, 100] },
  { code: "NGN", symbol: "₦", space: false, quick: [2000, 5000, 10000] },
  { code: "GHS", symbol: "₵", space: false, quick: [50, 100, 200] },
  { code: "KES", symbol: "KSh", space: true, quick: [500, 1000, 5000] },
  { code: "ZAR", symbol: "R", space: false, quick: [100, 200, 500] },
  { code: "INR", symbol: "₹", space: false, quick: [500, 1000, 2000] },
  { code: "JPY", symbol: "¥", space: false, quick: [1000, 5000, 10000] },
  { code: "CAD", symbol: "C$", space: false, quick: [20, 50, 100] },
  { code: "AUD", symbol: "A$", space: false, quick: [20, 50, 100] }
] as const;
