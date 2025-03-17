export interface IMetaData {
  reservationId?: string;
  userId?: string;
}

export interface IBaseInitializePayment {
  amount: number;
  email: string;
  callback_url?: string;
  reference: string;
  metadata: IMetaData;
}

export interface IInitializePaymentResponse {
  paymentUrl: string;
}

export interface IFlutterwaveInitializePayment {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  meta: IMetaData;
  customer: {
    email: string;
  };
}
