# Nahor Church — Sistema de Distribuição de Hinários e Bíblias

> Projeto desenvolvido em colaboração com um amigo, de forma totalmente filantrópica,
> para servir à Congregação Cristã no Brasil (CCB).

---

## Sobre o Projeto

Este sistema foi criado com amor e dedicação para auxiliar o Centro de Distribuição Regional
de Guarulhos no gerenciamento da distribuição de hinários e bíblias entre os setores da congregação.

Não há fins lucrativos. Todo o trabalho aqui é voluntário, nascido da vontade de
contribuir com a obra de Deus e facilitar o trabalho dos irmãos encarregados da distribuição.

---

## Funcionalidades

- **Dashboard** — visão geral dos 3 setores com saldo de crédito, estoque e vendas do mês
- **Registrar Venda** — registro de vendas (Dinheiro ou Pix) com atualização automática de estoque e crédito
- **Solicitar Reposição** — pedido de materiais ao distribuidor com controle de crédito disponível
- **Gestão de Pedidos** — aprovação ou recusa de pedidos pelo centro distribuidor
- **Histórico** — registro completo de todas as movimentações por setor

---

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 (App Router) | Framework principal |
| TypeScript | Tipagem estática |
| Chakra UI v2 | Componentes de interface |
| Framer Motion | Animações e transições |
| Three.js + @react-three/fiber | Cruz 3D animada no hero |
| localStorage | Persistência de dados (sem backend) |

---

## Como Rodar Localmente

```bash
# Clone o repositório
git clone https://github.com/erikgds2/Nahor_Church.git
cd Nahor_Church

# Instale as dependências
npm install

# Rode em modo desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Estrutura do Projeto

```
src/
├── app/               # Páginas (Next.js App Router)
│   ├── page.tsx       # Dashboard
│   ├── venda/         # Registrar Venda
│   ├── reposicao/     # Solicitar Reposição
│   ├── pedidos/       # Gestão de Pedidos
│   └── historico/     # Histórico de Transações
├── components/        # Componentes reutilizáveis
│   ├── HeroCanvas.tsx # Cena Three.js (cruz 3D + estrelas)
│   ├── HeroSection.tsx
│   ├── Navigation.tsx
│   ├── SectorCard.tsx
│   └── Footer.tsx
├── context/           # Estado global (AppContext)
└── lib/               # Tipos e utilitários (storage.ts, types.ts)
```

---

## Fase 2 — Próximas Evoluções

- Autenticação por papel (Distribuidor / Setor)
- Integração com sistema SIGA da CCB
- Conciliação automática via Pix (Recode)
- Relatórios e exportação em PDF
- Notificações para encarregados de setor

---

## Colaboração

Este projeto é fruto de parceria entre amigos que desejam contribuir com a congregação.
Qualquer irmão desenvolvedor que queira colaborar é bem-vindo — abra uma issue ou pull request.

**"Tudo o que fizerdes, fazei-o de todo o coração, como para o Senhor."**
— Colossenses 3:23

---

*Desenvolvido com fé e dedicação. Sem fins lucrativos.*
