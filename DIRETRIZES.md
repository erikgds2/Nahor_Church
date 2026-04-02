# DIRETRIZES DO PROJETO — CCB Nahor Church
> Documento de especificação técnica, revisado com base nos PDFs oficiais da CCB (abril 2026)

---

## 1. ENTIDADES E HIERARQUIA

```
DG (Distribuidora Geral — Brás/SP)
  └── DR (Distribuidora Regional — ex: Guarulhos)
        ├── DL (Distribuidora Local)
        │     └── FB (Fundo Bíblico — dentro de uma Casa de Oração)
        └── FB (Fundo Bíblico — vinculado direto à DR)
```

| Sigla | Nome completo | Papel |
|---|---|---|
| DG | Distribuidora Geral Brás | Fonte nacional de produtos, define lista de preços |
| DR | Distribuidora Regional | Abastece DLs e FBs da sua região |
| DL | Distribuidora Local | Intermediária entre DR e FBs locais |
| FB | Fundo Bíblico | Ponto de venda dentro da Casa de Oração |
| CO | Casa de Oração | Igreja local onde o FB opera |
| ADM | Administração | Gestão administrativa da localidade |

---

## 2. FLUXO PRINCIPAL DE NEGÓCIO

```
DG emite NF → DR confirma recebimento no SIGA → estoque DR atualizado
DR emite DT → DL/FB confirma recebimento no SIGA → estoque FB atualizado
FB vende à irmandade (Dinheiro ou Pix QR) → registra em FOR.DIST.01
FB deposita dinheiro na conta corrente da DR (mín. 1x/semana)
FB usa saldo em conta corrente para solicitar nova DT à DR
Mensalmente: FB fecha competência, imprime relatório, entrega à DR
```

---

## 3. REGRAS DE PAGAMENTO (CRÍTICO)

- ✅ **Dinheiro (espécie)**
- ✅ **Pix QR Code** — cada FB tem um QR exclusivo vinculado à conta da DR
- ❌ Máquina de cartão de débito/crédito → **PROIBIDO**
- ❌ Pix direto (chave/CPF) → **PROIBIDO**
- Troco em caixa: máximo **R$ 200,00** no FB
- Excedente deve ser depositado na conta da DR o quanto antes

---

## 4. CATÁLOGO DE PRODUTOS (Lista de Preços 01/09/2025)

### Hinários de Canto (HC-*)
| Código | Descrição | R$ unid. |
|---|---|---|
| HC-BV | Capa dura percalux, Baixa Visão, Espiral | R$ 70,00 |
| HC-100 | Capa mole laminada, Letra Maiúscula | R$ 12,00 |
| HC-101P | Capa dura percalux, pequeno | R$ 10,00 |
| HC-102B | Capa recouro maleável branco, pequeno | R$ 15,00 |
| HC-102P | Capa recouro maleável, pequeno | R$ 14,00 |
| HC-103P | Capa dura percalux, grande | R$ 15,00 |
| HC-105P | Capa recouro maleável, grande | R$ 20,00 |
| HC-200 | Capa dura percalux, espiral (Letra MAIÚSCULA) | R$ 30,00 |
| HC-205 | Capa recouro maleável, extra grande | R$ 30,00 |
| HC-206 | Capa dura percalux, extra grande, espiral | R$ 30,00 |

### Hinários de Música (HM-*)
| Código | Descrição | R$ unid. |
|---|---|---|
| HM-102 | Capa dura percalux, médio – Dó | R$ 32,00 |
| HM-109 | Capa dura percalux, médio – Órgão | R$ 50,00 |
| HM-110 | Capa dura percalux, médio – Si Bemol | R$ 35,00 |
| HM-111 | Capa dura percalux, médio – Mi Bemol | R$ 35,00 |
| HM-113 | Capa dura percalux, médio – Cordas | R$ 35,00 |
| HM-116 | Capa dura percalux, médio – Fá | R$ 50,00 |
| HM-117 | Capa dura percalux, médio – Tuba | R$ 32,00 |

### Bíblias (B-*, BZ-*)
| Código | Descrição | R$ unid. |
|---|---|---|
| B-1 | Capa recouro maleável, média, 14x21cm | R$ 35,00 |
| B-3 | Capa recouro maleável, média, 13,5x18,5cm | R$ 40,00 |
| B-5L | Capa dura percalux, grande, púlpito | R$ 100,00 |
| B-6 | Capa recouro maleável, mini, índice | R$ 25,00 |
| B-7 | Capa recouro maleável, média, 14x21cm | R$ 38,00 |
| B-9 | Capa recouro maleável, pequena | R$ 25,00 |
| B-14 | Capa recouro maleável, média, dic, conc | R$ 50,00 |
| B-15 | Capa mole laminada, média | R$ 25,00 |
| B-24 | Capa recouro, grande, Letra Gigante | R$ 90,00 |
| BZ-2 | Com zíper, capa recouro, pequena | R$ 35,00 |
| BZ-3 | Com zíper, capa recouro, média | R$ 50,00 |

### Véus (VA-*, VB-*, VR-*)
| Código | Descrição | R$ unid. |
|---|---|---|
| VA-A | Véu de algodão, adulto | R$ 12,00 |
| VA-C | Véu de algodão, criança | R$ 8,00 |
| VB-A | Véu com bolsa, adulto | R$ 5,00 |
| VB-C | Véu com bolsa, criança | R$ 5,00 |

> Lista completa em `pdf/LISTA DE PREÇOS 01_09_2025.pdf`
> Preços são nacionais — iguais em todo o Brasil

---

## 5. FORMULÁRIO DE VENDA (FOR.DIST.01)

Campos obrigatórios por venda (por culto):
1. Nome da Casa de Oração
2. Código da Casa de Oração
3. Data da venda
4. Código do produto
5. Quantidade
6. Valor unitário
7. Valor total (linha)
8. Subtotal Pix QR
9. Subtotal espécie
10. Total geral (Pix + espécie)

Regra: registrar ao final de cada culto, lançar no SIGA ao menos 1x/semana.

---

## 6. DECLARAÇÃO DE TRÂNSITO (DT)

Documento emitido pela DR ao enviar produtos ao FB:
- Relação detalhada dos produtos enviados
- Status no SIGA: "Pendente de Recebimento" → FB confirma → "Regular"
- Após confirmação: estoque do FB atualizado automaticamente

---

## 7. CONTA CORRENTE (CRÉDITO DO FB)

- FB vende → deposita dinheiro na conta bancária da DR
- DR registra depósito → aumenta conta corrente do FB
- FB usa conta corrente para solicitar DT (produtos)
- Saldo credor = disponível para aquisição
- Conciliação mensal entre FB e DR

---

## 8. CICLO MENSAL OBRIGATÓRIO

```
Semanal:
  [ ] Lançar vendas no SIGA
  [ ] Depositar dinheiro na conta da DR
  [ ] Anexar comprovantes de depósito no SIGA

Mensal (antes do fechamento):
  [ ] Conferência física do estoque
  [ ] Comparar estoque físico com relatório SIGA (Inventário de Produtos)
  [ ] Reconciliar conta corrente com DR
  [ ] Encerrar competência no SIGA
  [ ] Imprimir Relatório de Fechamento
  [ ] Assinar relatório e entregar à DR
```

---

## 9. INTEGRAÇÃO COM SIGA

URL: `https://siga.congregacao.org.br`

Módulos relevantes:
- `Produtos/Serviços > Fundo Bíblico > Novo > Saída` — registrar venda
- `Produtos/Serviços > Relatórios > Demons. Mensal FB` — demonstrativo mensal
- `Produtos/Serviços > Relatórios > Inventário Produto` — inventário
- `Produtos/Serviços > Fundo Bíblico > Confirmar Recebimento` — confirmar DT

> **Fase 2**: integrar via API REST com SIGA para sincronização automática

---

## 10. STACK TECNOLÓGICA DO SISTEMA

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Chakra UI v2 |
| Animações | Framer Motion 11 |
| 3D/Hero | Three.js + @react-three/fiber |
| Estado | React Context + localStorage |
| Persistência | localStorage (chave: `dist_hinarios`) |
| Deploy | Vercel (auto-deploy via GitHub) |
| Repo | github.com/erikgds2/Nahor_Church |

---

## 11. TELAS PLANEJADAS

| # | Tela | Status |
|---|---|---|
| 1 | Dashboard — visão geral DR/FB | ✅ Construído (básico) |
| 2 | Registro de Venda (FOR.DIST.01) | ✅ Construído (simplificado) |
| 3 | Solicitação de DT / Reposição | ✅ Construído (básico) |
| 4 | Gestão de Pedidos (DR aprova/recusa) | ✅ Construído |
| 5 | Histórico de Transações | ✅ Construído |
| 6 | Catálogo de Produtos (com códigos reais) | 🔲 Pendente |
| 7 | Conta Corrente do FB com DR | 🔲 Pendente |
| 8 | Depósito Bancário (registro) | 🔲 Pendente |
| 9 | Fechamento Mensal | 🔲 Pendente |
| 10 | Relatório de Fechamento (imprimível) | 🔲 Pendente |
| 11 | Inventário Físico vs SIGA | 🔲 Pendente |
| 12 | Checklist Mensal | 🔲 Pendente |

---

## 12. O QUE NÃO CONSTRUIR AGORA (FASE 2)

- Login/autenticação por papel
- Integração real com API SIGA
- Conciliação DR × DG automática
- Geração de QR Code Pix
- Emissão de DT em PDF
- Múltiplos usuários simultâneos
- E-commerce (proibido pela CCB — Tópico 25/2025)
