import { TransactionStatus } from '../entities/transaction.entity';

export class CreateTransactionEventDto {
  transaction_id: string;
  type: TransactionStatus;
  message: string;
  metadata?: Record<string, any>;
}
