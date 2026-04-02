# CÉREBRO DO PROJETO — CCB Nahor Church
> Documento de rastreamento de progresso para uso do assistente AI.
> **Leia este arquivo no início de cada sessão para saber exatamente onde parou e o que falta.**

---

## ESTADO ATUAL (02/04/2026)

### O que existe hoje
Next.js 14 + Chakra UI + Framer Motion + Three.js, deployado em:
`https://nahor-church.vercel.app` (auto-deploy via GitHub main)

### Arquivos criados
```
src/
  lib/
    types.ts          — tipos: Sector, Transaction, Order, AppData
    storage.ts        — localStorage key=dist_hinarios, defaultData, helpers
  context/
    AppContext.tsx     — AppProvider, useApp() → { data, updateData, resetAppData }
  components/
    ChakraProviders.tsx — tema CCB navy #1a3a5c + gold #d4a843
    HeroCanvas.tsx     — Three.js: cruz 3D dourada + estrelas
    HeroSection.tsx    — banner hero com gradiente navy + texto animado
    Navigation.tsx     — nav sticky com rota ativa
    SectorCard.tsx     — card do setor com hover lift
    Footer.tsx         — resetar dados
  app/
    layout.tsx         — Inter font, providers, Hero + Nav + Footer
    page.tsx           — Dashboard: resumo geral + 3 SectorCards
    venda/page.tsx     — form venda: setor/material/qty/pagamento/preço/data
    reposicao/page.tsx — form reposição com preview de crédito
    pedidos/page.tsx   — tabela com aprovar/recusar
    historico/page.tsx — filtros por setor/tipo/data
```

---

## O QUE ESTÁ ERRADO / INCOMPLETO HOJE

| Problema | Impacto |
|---|---|
| Apenas "hinário" e "bíblia" genéricos | Deveria ter catálogo com códigos reais (HC-102P, B-1, etc.) |
| "Setor" é a entidade | Deveria ser "Fundo Bíblico (FB)" dentro de uma "Casa de Oração (CO)" |
| Preços fixos R$25/R$45 | Lista oficial tem dezenas de produtos com preços diferentes |
| Pix genérico | Deve ser especificamente "Pix QR Code" (não transferência direta) |
| Sem DT (Declaração de Trânsito) | Pedido de reposição deve gerar DT |
| Sem conta corrente real | FB tem saldo credor que é alimentado por depósitos bancários |
| Sem ciclo mensal | Não existe fechamento, inventário ou checklist |
| Sem relatórios imprimíveis | Necessário para prestação de contas à DR |

---

## PLANO DE AÇÃO — PARTES DO PROJETO

### PARTE 1 — Refatoração de Dados e Catálogo
**Objetivo:** Base sólida com produtos reais e entidades corretas

Tarefas:
- [ ] Renomear entidade `Sector` → `FundoBiblico` (FB)
- [ ] Adicionar entidade `CasaDeOracao` (CO) — FB pertence a uma CO
- [ ] Ampliar `types.ts`: adicionar `Produto` (código, descrição, preço), `DT`, `Deposito`, `FechamentoMensal`
- [ ] Criar catálogo de produtos em `src/lib/catalog.ts` com ao menos 25 produtos principais da lista de preços
- [ ] Atualizar `storage.ts` com defaultData realista (FBs, não "setores")
- [ ] Atualizar `AppContext` para suportar novos tipos

**Resultado esperado:** dados corretos no localStorage, sem quebrar o que já existe no visual

---

### PARTE 2 — Tela de Registro de Venda (FOR.DIST.01 fiel)
**Objetivo:** Formulário de venda idêntico ao processo real da CCB

Tarefas:
- [ ] Redesenhar `src/app/venda/page.tsx`
- [ ] Campos: CO/FB, data, produto (busca por código ou nome), qtd, preço unit, total linha
- [ ] Múltiplos itens por culto (tabela dinâmica de itens vendidos)
- [ ] Subtotais separados: total Pix QR / total espécie / total geral
- [ ] Validação: impedir pagamento por cartão (somente Pix QR ou dinheiro)
- [ ] Ao salvar: debitar estoque, adicionar ao caixa do FB

**Resultado esperado:** formulário que reflete fielmente o FOR.DIST.01

---

### PARTE 3 — Catálogo, DT e Estoque
**Objetivo:** Fluxo completo de entrada de produtos via DT

Tarefas:
- [ ] Tela de Catálogo de Produtos (listagem com busca por código/nome)
- [ ] Tela de Solicitação de DT: FB solicita produtos à DR
  - Selecionar FB, listar itens + quantidades desejadas
  - Sistema mostra custo total vs saldo conta corrente
  - Bloqueia se saldo insuficiente
- [ ] DR aprova → gera DT com status "Pendente de Recebimento"
- [ ] FB confirma recebimento → estoque atualizado, status DT → "Regular"
- [ ] DR recusa → saldo devolvido ao FB
- [ ] Histórico de DTs com filtros

**Resultado esperado:** fluxo DR → DT → FB funcionando corretamente

---

### PARTE 4 — Conta Corrente e Depósitos Bancários
**Objetivo:** Controle financeiro real do FB

Tarefas:
- [ ] Criar tela "Conta Corrente" — extrato do FB com a DR
  - Entradas: depósitos feitos pelo FB na conta da DR
  - Saídas: aquisições (DTs) pagas com crédito
  - Saldo atual disponível
- [ ] Tela de Registro de Depósito:
  - Campos: FB, data, valor, forma (Pix/depósito bancário), comprovante (texto)
  - Ao salvar: adiciona saldo à conta corrente do FB
- [ ] Alertas: saldo abaixo de determinado valor, caixa físico acima de R$200

**Resultado esperado:** controle de conta corrente funcionando

---

### PARTE 5 — Fechamento Mensal e Relatórios
**Objetivo:** Ciclo mensal obrigatório da CCB

Tarefas:
- [ ] Tela de Fechamento Mensal:
  - Checklist: estoque conferido? caixa conferido? conta corrente conferida?
  - Campo: estoque físico contado (por produto) vs sistema
  - Divergências destacadas
  - Botão "Encerrar Competência" → bloqueia lançamentos do mês
- [ ] Relatório de Fechamento (imprimível via CSS print):
  - Cabeçalho: nome FB, CO, mês/ano, responsável
  - Resumo: vendas totais, depósitos, saldo final CC, estoque final
- [ ] Tela de Relatórios:
  - Demonstrativo Mensal por FB
  - Inventário de Produtos
  - Extrato de Conta Corrente por período

**Resultado esperado:** fechamento mensal funcional + relatório imprimível

---

### PARTE 6 — Refinamento Visual e UX
**Objetivo:** Polimento final antes de produção

Tarefas:
- [ ] Melhorar Dashboard: separar visão DR vs visão FB
- [ ] Adicionar loading states e empty states elegantes
- [ ] Melhorar responsividade mobile (usado no culto no celular)
- [ ] Revisão de acessibilidade (contraste, tamanhos de texto)
- [ ] Testar fluxo completo do começo ao fim

---

### FASE 2 (futuro — não construir agora)
- Autenticação (NextAuth) — perfis: DR Admin, FB Colaborador
- Integração API SIGA (https://siga.congregacao.org.br)
- Conciliação automática DR × DG
- Geração de QR Code Pix por FB
- Emissão de DT em PDF
- Notificações (push/WhatsApp) para aprovações
- Múltiplos usuários simultâneos

---

## DECISÕES TÉCNICAS JÁ TOMADAS

| Decisão | Motivo |
|---|---|
| localStorage (sem backend) | Simplicidade, zero infra, abre direto no navegador |
| Next.js 14.2.35 (não 15+) | Chakra UI v2 requer React 18, Next 15 exige React 19 |
| `next.config.mjs` (não `.ts`) | `.ts` só suportado no Next.js 15+ |
| Vercel para deploy | Detecção automática de Next.js, deploy gratuito, auto-deploy no push |
| `AppContext` com `updateData(newData)` | Mutação imutável: copiar data, modificar, salvar |
| Three.js via `dynamic({ ssr: false })` | Evita erros SSR no Next.js App Router |

---

## ARQUIVOS CRÍTICOS PARA LER ANTES DE MODIFICAR

| Arquivo | Por que é crítico |
|---|---|
| `src/lib/types.ts` | Todos os tipos — mudar aqui quebra tudo |
| `src/lib/storage.ts` | defaultData e chave localStorage |
| `src/context/AppContext.tsx` | Estado global — todas as páginas dependem |
| `src/components/ChakraProviders.tsx` | Tema CCB — cores e tokens |

---

## REFERÊNCIAS DOS PDFs

| PDF | Conteúdo principal |
|---|---|
| `MAD.DIST.01_REV01` | Manual completo do Fundo Bíblico — regras gerais |
| `IT.DIST.01` | Vendas via Pix QR Code — processo passo a passo |
| `IT.DIST.02` | Registro no SIGA do recebimento via Pix |
| `IT.DIST.03` | Conciliação DR × DG mensal |
| `IT.DIST.04` | Abertura de Fundo Bíblico |
| `IT.DIST.05` | Aquisição, distribuição e controle de materiais |
| `IT.DIST.06` | Transferência de saldo entre administrações |
| `LISTA DE PREÇOS 01_09_2025` | Todos os produtos com códigos e preços oficiais |
| `Manual SIGA Cap.04` | Como usar o SIGA — entradas/saídas de produtos |

---

## SESSÃO ATUAL

**Última sessão:** 02/04/2026
**Partes concluídas:** Nenhuma (app base construído, aguardando refatoração por partes)
**Próxima parte a executar:** PARTE 1 — Refatoração de Dados e Catálogo
**Observações:** Deploy no Vercel funcionando. Build passou após corrigir next.config.ts → .mjs
