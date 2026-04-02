import { Produto } from './types';

// Catálogo oficial — Lista de Preços CCB atualizada em 01/09/2025
// Fonte: Distribuidora de Bíblias e Hinários - (11) 3299-0293 - distribuidora.bras@congregacao.org.br

export const catalog: Produto[] = [
  // ── Hinários de Canto ──────────────────────────────────────────────────────
  { codigo: 'HC-100',  descricao: 'Hinário de Canto — Capa mole laminada, Letra Maiúscula',          categoria: 'hinario_canto', preco: 12.00 },
  { codigo: 'HC-101P', descricao: 'Hinário de Canto — Capa dura percalux, pequeno',                  categoria: 'hinario_canto', preco: 10.00 },
  { codigo: 'HC-102B', descricao: 'Hinário de Canto — Capa recouro maleável branco, pequeno',        categoria: 'hinario_canto', preco: 15.00 },
  { codigo: 'HC-102P', descricao: 'Hinário de Canto — Capa recouro maleável, pequeno',               categoria: 'hinario_canto', preco: 14.00 },
  { codigo: 'HC-103P', descricao: 'Hinário de Canto — Capa dura percalux, grande',                   categoria: 'hinario_canto', preco: 15.00 },
  { codigo: 'HC-105P', descricao: 'Hinário de Canto — Capa recouro maleável, grande',                categoria: 'hinario_canto', preco: 20.00 },
  { codigo: 'HC-200',  descricao: 'Hinário de Canto — Capa dura percalux, espiral, Letra MAIÚSCULA', categoria: 'hinario_canto', preco: 30.00 },
  { codigo: 'HC-205',  descricao: 'Hinário de Canto — Capa recouro maleável, extra grande',          categoria: 'hinario_canto', preco: 30.00 },
  { codigo: 'HC-206',  descricao: 'Hinário de Canto — Capa dura percalux, extra grande, espiral',    categoria: 'hinario_canto', preco: 30.00 },
  { codigo: 'HC-441',  descricao: 'Hinário de Canto — Capa mole laminada, Hinos RJM, Letra MAIÚSCULA', categoria: 'hinario_canto', preco: 30.00 },
  { codigo: 'HC-BV',   descricao: 'Hinário de Canto — Capa dura, Baixa Visão, Espiral, 21x29 cm',   categoria: 'hinario_canto', preco: 70.00 },

  // ── Hinários de Música ─────────────────────────────────────────────────────
  { codigo: 'HM-102',  descricao: 'Hinário de Música — Capa dura percalux, médio – Dó',             categoria: 'hinario_musica', preco: 32.00 },
  { codigo: 'HM-109',  descricao: 'Hinário de Música — Capa dura percalux, médio – Órgão',          categoria: 'hinario_musica', preco: 50.00 },
  { codigo: 'HM-110',  descricao: 'Hinário de Música — Capa dura percalux, médio – Si Bemol',       categoria: 'hinario_musica', preco: 35.00 },
  { codigo: 'HM-111',  descricao: 'Hinário de Música — Capa dura percalux, médio – Mi Bemol',       categoria: 'hinario_musica', preco: 35.00 },
  { codigo: 'HM-113',  descricao: 'Hinário de Música — Capa dura percalux, médio – Cordas',         categoria: 'hinario_musica', preco: 35.00 },
  { codigo: 'HM-116',  descricao: 'Hinário de Música — Capa dura percalux, médio – Fá',             categoria: 'hinario_musica', preco: 50.00 },
  { codigo: 'HM-117',  descricao: 'Hinário de Música — Capa dura percalux, médio – Tuba',           categoria: 'hinario_musica', preco: 32.00 },
  { codigo: 'HM-202',  descricao: 'Hinário de Música — Capa dura percalux, pequeno – Dó',           categoria: 'hinario_musica', preco: 25.00 },
  { codigo: 'HM-209',  descricao: 'Hinário de Música — Capa dura percalux, pequeno – Órgão',        categoria: 'hinario_musica', preco: 28.00 },
  { codigo: 'HM-302',  descricao: 'Hinário de Música — Capa dura percalux, grande – Dó',            categoria: 'hinario_musica', preco: 45.00 },

  // ── Bíblias ────────────────────────────────────────────────────────────────
  { codigo: 'B-1',     descricao: 'Bíblia — Capa recouro maleável, média, 14x21 cm',                categoria: 'biblia', preco: 35.00 },
  { codigo: 'B-3',     descricao: 'Bíblia — Capa recouro maleável, média, 13,5x18,5 cm',            categoria: 'biblia', preco: 40.00 },
  { codigo: 'B-5L',    descricao: 'Bíblia — Capa dura percalux, grande, púlpito, 21x27,5 cm',       categoria: 'biblia', preco: 100.00 },
  { codigo: 'B-6',     descricao: 'Bíblia — Capa recouro maleável, mini, índice, 7x11 cm',          categoria: 'biblia', preco: 25.00 },
  { codigo: 'B-7',     descricao: 'Bíblia — Capa recouro maleável, média, 14x21 cm',                categoria: 'biblia', preco: 38.00 },
  { codigo: 'B-8',     descricao: 'Bíblia — Capa recouro maleável, média, Dic, Conc, 14x21 cm',     categoria: 'biblia', preco: 60.00 },
  { codigo: 'B-9',     descricao: 'Bíblia — Capa recouro maleável, pequena, 11x13 cm',              categoria: 'biblia', preco: 25.00 },
  { codigo: 'B-14',    descricao: 'Bíblia — Capa recouro maleável, média, dic, conc, 13x17,5 cm',   categoria: 'biblia', preco: 50.00 },
  { codigo: 'B-15',    descricao: 'Bíblia — Capa mole laminada, média, 13x18,5 cm',                 categoria: 'biblia', preco: 25.00 },
  { codigo: 'B-24',    descricao: 'Bíblia — Capa recouro maleável, grande, Letra Gigante, 16x23,5 cm', categoria: 'biblia', preco: 90.00 },
  { codigo: 'BZ-2',    descricao: 'Bíblia com Zíper — Capa recouro maleável, pequena, 11x13 cm',    categoria: 'biblia', preco: 35.00 },
  { codigo: 'BZ-3',    descricao: 'Bíblia com Zíper — Capa recouro maleável, média, 13x18,5 cm',    categoria: 'biblia', preco: 50.00 },
  { codigo: 'BZ-16',   descricao: 'Bíblia com Zíper — Capa recouro maleável, grande, 13,5x18,5 cm', categoria: 'biblia', preco: 55.00 },
  { codigo: 'B-16',    descricao: 'Bíblia com Hinário — Capa recouro maleável, média, 13x18,5 cm',  categoria: 'biblia', preco: 45.00 },

  // ── Véus ───────────────────────────────────────────────────────────────────
  { codigo: 'VA-A',    descricao: 'Véu de algodão, adulto',                                          categoria: 'veu', preco: 12.00 },
  { codigo: 'VA-C',    descricao: 'Véu de algodão, criança',                                         categoria: 'veu', preco: 8.00  },
  { codigo: 'VB-A',    descricao: 'Véu com bolsa, adulto',                                           categoria: 'veu', preco: 5.00  },
  { codigo: 'VB-C',    descricao: 'Véu com bolsa, criança',                                          categoria: 'veu', preco: 5.00  },
  { codigo: 'VR-A',    descricao: 'Véu redondo de algodão, adulto',                                  categoria: 'veu', preco: 25.00 },

  // ── Métodos Musicais ───────────────────────────────────────────────────────
  { codigo: 'MOR-V1',  descricao: 'Método para Organista — Volume 1',                                categoria: 'metodo', preco: 8.00  },
  { codigo: 'MOR-V2',  descricao: 'Método para Organista — Volume 2',                                categoria: 'metodo', preco: 8.00  },
  { codigo: 'MOR-V3',  descricao: 'Método para Organista — Volume 3',                                categoria: 'metodo', preco: 8.00  },
  { codigo: 'MOR-V4',  descricao: 'Método para Organista — Volume 4',                                categoria: 'metodo', preco: 8.00  },
  { codigo: '.MSA',    descricao: 'Método Simplificado de Aprendizagem Musical',                      categoria: 'metodo', preco: 20.00 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getProduto(codigo: string): Produto | undefined {
  return catalog.find(p => p.codigo === codigo);
}

export function getProdutoLabel(codigo: string): string {
  return catalog.find(p => p.codigo === codigo)?.descricao ?? codigo;
}

export const categoriaLabel: Record<string, string> = {
  hinario_canto:  'Hinário de Canto',
  hinario_musica: 'Hinário de Música',
  biblia:         'Bíblia',
  veu:            'Véu',
  metodo:         'Método Musical',
  outro:          'Outros',
};

export function getProdutosByCategoria(cat: string): Produto[] {
  return catalog.filter(p => p.categoria === cat);
}
