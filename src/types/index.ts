export interface Recipient {
  address: string;
  amount: string;
}

export interface TransactionParams {
  recipients: Recipient[];
  token?: string;
  isNative: boolean;
}