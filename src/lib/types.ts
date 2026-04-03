// ─── Enums / union types ────────────────────────────────────────────────────

export type Categoria =
  | 'hinario_canto'
  | 'hinario_musica'
  | 'biblia'
  | 'veu'
  | 'metodo'
  | 'outro';

export type PaymentType = 'Dinheiro' | 'Pix QR Code';
export type OrderStatus = 'Pendente' | 'Aguardando Recebimento' | 'Regular' | 'Recusado';
export type TransactionType = 'venda' | 'reposicao';

// ─── Produto ────────────────────────────────────────────────────────────────

export interface Produto {
  codigo: string;       // ex: 'HC-102P'
  descricao: string;    // ex: 'Hinário - Capa recouro maleável, pequeno'
  categoria: Categoria;
  preco: number;        // R$ oficial nacional
}

// ─── Fundo Bíblico (FB) ─────────────────────────────────────────────────────
// Pequeno estoque de produtos dentro de uma Casa de Oração.

export type TipoDistribuidor = 'DR' | 'DL';

export interface FundoBiblico {
  id: string;
  tipo: TipoDistribuidor;  // DR = Distribuidora Regional, DL = Distribuidora Local
  coNome: string;          // nome da distribuidora
  coCodigo: string;        // código no sistema
  contaCorrente: number;   // saldo credor disponível para aquisição (R$)
  estoque: Record<string, number>; // { 'HC-102P': 10, 'B-1': 5, ... }
}

// ─── Transação ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  date: string;              // ISO date string
  fundoId: string;
  type: TransactionType;
  payment?: PaymentType;
  produtoCodigo: string;     // código do produto ex: 'HC-102P'
  quantity: number;
  amount: number;            // valor total (positivo = entrada crédito, negativo = débito)
}

// ─── Pedido / DT ────────────────────────────────────────────────────────────
// Solicitação de reposição de um FB à DR (gera uma DT - Declaração de Trânsito)

export interface Order {
  id: string;
  dtId: string;              // agrupa itens da mesma DT
  fundoId: string;
  produtoCodigo: string;
  quantity: number;
  cost: number;
  status: OrderStatus;
  requestedAt: string;       // ISO datetime
  processedAt: string | null;
}

// ─── Depósito bancário ───────────────────────────────────────────────────────
// Entrada de crédito na conta corrente de uma DL (depósito feito na conta da DR)

export type DepositoForma = 'Pix' | 'Depósito Bancário';

export interface Deposito {
  id: string;
  fundoId: string;
  data: string;           // ISO date string
  valor: number;
  forma: DepositoForma;
  comprovante: string;    // número/descrição do comprovante
  registradoEm: string;  // ISO datetime
}

// ─── AppData ────────────────────────────────────────────────────────────────

export interface AppData {
  fundos: FundoBiblico[];
  transactions: Transaction[];
  orders: Order[];
  depositos: Deposito[];
}
