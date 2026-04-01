export type MaterialType = 'hinario' | 'biblia';
export type PaymentType = 'Dinheiro' | 'Pix';
export type OrderStatus = 'Pendente' | 'Aprovado' | 'Recusado';
export type TransactionType = 'venda' | 'reposicao';

export interface Sector {
  id: string;
  name: string;
  credit: number;
  stock: { hinario: number; biblia: number };
}

export interface Transaction {
  id: string;
  date: string;
  sectorId: string;
  type: TransactionType;
  payment?: PaymentType;
  material: MaterialType;
  quantity: number;
  amount: number;
}

export interface Order {
  id: string;
  sectorId: string;
  material: MaterialType;
  quantity: number;
  cost: number;
  status: OrderStatus;
  requestedAt: string;
  processedAt: string | null;
}

export interface AppData {
  sectors: Sector[];
  prices: { hinario: number; biblia: number };
  transactions: Transaction[];
  orders: Order[];
}
