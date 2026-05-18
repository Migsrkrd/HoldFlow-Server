import {
  TransactionCurrency,
  TransactionReleaseCondition,
} from '../entities/transaction.entity';

export class CreateTransactionDto {
  partner_id: string;
  buyer_name: string;
  seller_name: string;
  amount: number;
  currency: TransactionCurrency;
  release_condition: TransactionReleaseCondition;
  release_date?: Date;
}
