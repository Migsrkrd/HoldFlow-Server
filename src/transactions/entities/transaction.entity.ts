export class Transaction {
  id: string;
  partner_id: string;
  buyer_name: string;
  seller_name: string;
  amount: number;
  currency: TransactionCurrency;
  status: TransactionStatus;
  release_condition: TransactionReleaseCondition;
  release_date: Date;
  created_at: Date;
  updated_at: Date;
}

export enum TransactionStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  HELD = 'held',
  PENDING_RELEASE = 'pending_release',
  RELEASED = 'released',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export enum TransactionReleaseCondition {
  BUYER_APPROVAL = 'buyer_approval',
  DELIVERY_UPLOADED = 'delivery_uploaded',
  DATE_BASED = 'date_based',
}

export enum TransactionCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}
