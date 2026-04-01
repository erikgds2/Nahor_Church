import { AppData } from './types';

// FASE 2 — Integração SIGA: conectar via API REST para sincronizar pedidos e estoque
// FASE 2 — Integração Recode/Pix: validar pagamentos Pix em tempo real antes de confirmar crédito

const STORAGE_KEY = 'dist_hinarios';

export const defaultData: AppData = {
  sectors: [
    { id: 'norte', name: 'Setor Norte', credit: 150.00, stock: { hinario: 10, biblia: 5 } },
    { id: 'sul', name: 'Setor Sul', credit: 80.00, stock: { hinario: 7, biblia: 3 } },
    { id: 'leste', name: 'Setor Leste', credit: 220.00, stock: { hinario: 15, biblia: 8 } },
  ],
  prices: { hinario: 25.00, biblia: 45.00 },
  transactions: [],
  orders: [],
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return JSON.parse(JSON.stringify(defaultData));
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { saveData(defaultData); return JSON.parse(JSON.stringify(defaultData)); }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.sectors) throw new Error();
    return parsed;
  } catch { saveData(defaultData); return JSON.parse(JSON.stringify(defaultData)); }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  const fresh = JSON.parse(JSON.stringify(defaultData));
  saveData(fresh);
  return fresh;
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getMaterialLabel(m: string): string {
  return m === 'hinario' ? 'Hinário' : 'Bíblia';
}

export function computeSoldMonth(sectorId: string, transactions: AppData['transactions']): number {
  const now = new Date();
  return transactions
    .filter(t => t.sectorId === sectorId && t.type === 'venda')
    .reduce((acc, t) => {
      const d = new Date(t.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) return acc + t.amount;
      return acc;
    }, 0);
}
