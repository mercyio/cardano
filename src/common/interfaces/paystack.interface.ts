export interface IPaystackPaymentWebhook {
  event: string;
  data: IPaystackWebhookChargeData | IPaystackWebhookTransferData;
}

export interface IPaystackWebhookChargeData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: null;
  gateway_response: string;
  paid_at: Date;
  created_at: Date;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: {
    orderId?: string;
    userId?: string;
  };
  log: any;
  fees: null;
  customer: ICustomer;
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    account_name: string;
  };
  plan: null;
}

export interface ICustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: null;
  metadata: null;
  risk_action: string;
}

export interface IPaystackTransferToBankPayload {
  type?: string;
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
  source?: string;
  amount: number; // Amount in the lowest currency unit (e.g., kobo for NGN)
  reference: string; // Unique payment reference
  recipient?: string; // Code for transfer recipient
  reason: string; // Payment description
}

export interface IPaystackWebhookTransferData {
  type?: string;
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
  source?: string;
  amount: number;
  reference: string;
  recipient?: string;
  reason: string;
  integration?: {
    id: number;
    is_live: boolean;
    business_name: string;
  };
  status: string;
  transfer_code: string;
  transferred_at: string | null;
  recipient_details?: {
    active: boolean;
    currency: string;
    description: string;
    domain: string;
    email: string | null;
    id: number;
    integration: number;
    metadata: any;
    name: string;
    recipient_code: string;
    type: string;
    is_deleted: boolean;
    details: {
      account_number: string;
      account_name: string | null;
      bank_code: string;
      bank_name: string;
    };
    created_at: string;
    updated_at: string;
  };
  session?: {
    provider: string | null;
    id: string | null;
  };
  created_at: string;
  updated_at: string;
}
