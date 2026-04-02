import { AppData } from './types';

const STORAGE_KEY = 'dist_hinarios_v2';

export const defaultData: AppData = {
  fundos: [
    {
      id: 'fb-central',
      coNome: 'Casa de Oração Central',
      coCodigo: 'GRU-001',
      contaCorrente: 150.00,
      estoque: { 'HC-102P': 10, 'HC-103P': 5, 'B-1': 5, 'B-3': 3, 'VA-A': 8 },
    },
    {
      id: 'fb-norte',
      coNome: 'Casa de Oração Norte',
      coCodigo: 'GRU-002',
      contaCorrente: 80.00,
      estoque: { 'HC-102P': 7, 'HC-103P': 4, 'B-1': 3, 'VA-A': 5 },
    },
    {
      id: 'fb-sul',
      coNome: 'Casa de Oração Sul',
      coCodigo: 'GRU-003',
      contaCorrente: 220.00,
      estoque: { 'HC-102P': 15, 'HC-103P': 8, 'B-1': 8, 'B-3': 5, 'VA-A': 12 },
    },
  ],
  transactions: [],
  orders: [],
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return deepClone(defaultData);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { saveData(defaultData); return deepClone(defaultData); }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.fundos) throw new Error();
    return parsed;
  } catch { saveData(defaultData); return deepClone(defaultData); }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  const fresh = deepClone(defaultData);
  saveData(fresh);
  return fresh;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ─── Formatação ───────────────────────────────────────────────────────────────

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Cálculo de vendas do mês ─────────────────────────────────────────────────

export function computeVendasMes(fundoId: string, transactions: AppData['transactions']): number {
  const now = new Date();
  return transactions
    .filter(t => t.fundoId === fundoId && t.type === 'venda')
    .reduce((acc, t) => {
      const d = new Date(t.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
        return acc + t.amount;
      return acc;
    }, 0);
}

// ─── Estoque total de um produto em todos os FBs ──────────────────────────────

export function getEstoqueTotal(codigo: string, fundos: AppData['fundos']): number {
  return fundos.reduce((acc, f) => acc + (f.estoque[codigo] ?? 0), 0);
}
