import { AppData } from './types';

const STORAGE_KEY = 'dist_hinarios_v4';

export const defaultData: AppData = {
  fundos: [
    {
      id: 'dr-gopouva',
      tipo: 'DR',
      coNome: 'DR Gopouva — Setores 1 e 2',
      coCodigo: 'DR-GRU',
      contaCorrente: 0,
      estoque: {},
    },
    {
      id: 'dl-setor4',
      tipo: 'DL',
      coNome: 'DL Setor 4 — Bairro dos Pimentas',
      coCodigo: 'DL-S04',
      contaCorrente: 0,
      estoque: {},
    },
    {
      id: 'dl-setor3',
      tipo: 'DL',
      coNome: 'DL Setor 3 — Jardim Novo Portugal',
      coCodigo: 'DL-S03',
      contaCorrente: 0,
      estoque: {},
    },
  ],
  transactions: [],
  orders: [],
  depositos: [],
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return deepClone(defaultData);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { saveData(defaultData); return deepClone(defaultData); }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.fundos) throw new Error();
    if (!parsed.depositos) parsed.depositos = [];
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
