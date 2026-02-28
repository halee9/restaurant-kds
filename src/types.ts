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
  displayId: string;
  source: OrderSource;
  status: OrderStatus;
  isDelivery: boolean;
  isScheduled: boolean;
  displayName: string;
  pickupAt: string;
  lineItems: OrderLineItem[];
  totalMoney: number; // cents
  note?: string;
  createdAt: string;
  updatedAt: string;
}
