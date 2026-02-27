export type OrderSource = 'Kiosk' | 'DoorDash' | 'Uber Eats' | 'Grubhub' | 'Square Online' | 'Unknown';

export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export interface OrderLineItem {
  name: string;
  quantity: string;
  variationName?: string;
  modifiers?: string[];
  totalMoney: number; // cents
}

export interface KDSOrder {
  id: string;
  displayId: string; // last 4 chars of id
  source: OrderSource;
  status: OrderStatus;
  lineItems: OrderLineItem[];
  totalMoney: number; // cents
  note?: string;
  createdAt: string;
  updatedAt: string;
}
