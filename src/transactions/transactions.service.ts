/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { CreateTransactionEventDto } from './dto/create-transaction-event.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('transactions')
      .insert(createTransactionDto)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new Error('Failed to create transaction');
    return data as Transaction;
  }

  async findAll(): Promise<Transaction[]> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data) throw new Error('Failed to get transactions');
    return data as Transaction[];
  }

  async findOne(id: string): Promise<Transaction> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Failed to get transaction');
    return data as Transaction;
  }

  private async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<Transaction> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('transactions')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new Error('Failed to update transaction status');
    return data;
  }

  async approveRelease(id: string): Promise<Transaction> {
    const transaction = await this.findOne(id);
    if (
      transaction.status !== TransactionStatus.HELD &&
      transaction.status !== TransactionStatus.PENDING_RELEASE
    ) {
      throw new BadRequestException(
        `Cannot release transaction with status: ${transaction.status}`,
      );
    }

    const updated = await this.updateTransactionStatus(
      id,
      TransactionStatus.RELEASED,
    );
    await this.createEvent({
      transaction_id: id,
      type: TransactionStatus.RELEASED,
      message: 'Transaction payout was released',
    });

    return updated;
  }

  async fund(id: string): Promise<Transaction> {
    const transaction = await this.findOne(id);
    if (transaction.status !== TransactionStatus.CREATED) {
      throw new Error(
        'cannot fund transaction with status code: ' + transaction.status,
      );
    }

    try {
      const updated = await this.updateTransactionStatus(
        id,
        TransactionStatus.HELD,
      );
      await this.createEvent({
        transaction_id: id,
        type: TransactionStatus.HELD,
        message: 'Transaction was funded and placed on hold',
        metadata: {
          transaction_id: id,
          amount: transaction.amount,
          currency: transaction.currency,
        },
      });
      return updated;
    } catch (error) {
      await this.updateTransactionStatus(id, TransactionStatus.CREATED);
      console.error('Failed to fund transaction', error);
      throw error;
    }
  }

  private async createEvent(
    createTransactionEventDto: CreateTransactionEventDto,
  ) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('transaction_events')
      .insert(createTransactionEventDto)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new Error('Failed to create event');
    return data;
  }
}
