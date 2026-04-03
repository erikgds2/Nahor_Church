'use client';
import { useState } from 'react';
import {
  Container, Heading, Box, Select, HStack, VStack, Text,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Stat, StatLabel, StatNumber, Divider, Button, Tabs,
  TabList, Tab, TabPanels, TabPanel, Badge,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { getProduto } from '@/lib/catalog';

export default function RelatoriosPage() {
  const { data } = useApp();

  const hoje = new Date();
  const competenciaDefault = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

  const [fundoId, setFundoId] = useState('');
  const [competencia, setCompetencia] = useState(competenciaDefault);

  const fundo = data.fundos.find(f => f.id === fundoId);
  const [ano, mes] = competencia.split('-').map(Number);

  // Vendas do período
  const vendasPeriodo = data.transactions.filter(t => {
    if (t.fundoId !== fundoId || t.type !== 'venda') return false;
    const d = new Date(t.date);
    return d.getFullYear() === ano && d.getMonth() + 1 === mes;
  });
  const totalVendasPix = vendasPeriodo.filter(t => t.payment === 'Pix QR Code').reduce((a, t) => a + t.amount, 0);
  const totalVendasDinheiro = vendasPeriodo.filter(t => t.payment === 'Dinheiro').reduce((a, t) => a + t.amount, 0);
  const totalVendas = totalVendasPix + totalVendasDinheiro;

  // Depósitos do período
  const depositosPeriodo = (data.depositos ?? []).filter(d => {
    if (d.fundoId !== fundoId) return false;
    const dt = new Date(d.data);
    return dt.getFullYear() === ano && dt.getMonth() + 1 === mes;
  });
  const totalDepositos = depositosPeriodo.reduce((a, d) => a + d.valor, 0);

  // DTs do período
  const dtsPeriodo = (() => {
    const dtIds = new Set<string>();
    return data.orders.filter(o => {
      if (o.fundoId !== fundoId) return false;
      const dtId = o.dtId ?? o.id;
      if (dtIds.has(dtId)) return false;
      const d = new Date(o.requestedAt);
      if (d.getFullYear() !== ano || d.getMonth() + 1 !== mes) return false;
      dtIds.add(dtId);
      return true;
    });
  })();

  // Inventário atual
  const estoqueItens = fundo
    ? Object.entries(fundo.estoque).filter(([, q]) => q > 0)
    : [];

  const totalEstoqueValor = estoqueItens.reduce((acc, [codigo, qty]) => {
    const prod = getProduto(codigo);
    return acc + qty * (prod?.preco ?? 0);
  }, 0);

  // Extrato CC (todos os períodos)
  const extrato: { data: string; desc: string; valor: number }[] = [];
  (data.depositos ?? []).filter(d => d.fundoId === fundoId).forEach(d => {
    extrato.push({ data: d.data, desc: `Depósito — ${d.forma}${d.comprovante ? ' · ' + d.comprovante : ''}`, valor: d.valor });
  });
  const dtIdsCC = new Set<string>();
  data.orders.filter(o => o.fundoId === fundoId && o.status !== 'Pendente' && o.status !== 'Recusado').forEach(o => {
    const dtId = o.dtId ?? o.id;
    if (dtIdsCC.has(dtId)) return;
    dtIdsCC.add(dtId);
    const itens = data.orders.filter(x => (x.dtId ?? x.id) === dtId);
    const custo = itens.reduce((a, x) => a + x.cost, 0);
    extrato.push({ data: (o.processedAt ?? o.requestedAt).slice(0, 10), desc: `DT ${dtId}`, valor: -custo });
  });
  extrato.sort((a, b) => a.data.localeCompare(b.data));
  let saldoAcc = 0;
  const extratoSaldo = extrato.map(l => { saldoAcc += l.valor; return { ...l, saldo: saldoAcc }; });

  const mesNome = new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="1000px" px={4} py={6}>
          {/* Controles — ocultos na impressão */}
          <Box className="no-print">
            <Heading size="lg" color="brand.700" mb={2}>Relatórios</Heading>
            <Text color="gray.500" fontSize="sm" mb={5}>
              Selecione a distribuidora e competência para gerar os relatórios.
            </Text>
            <HStack spacing={4} mb={6} flexWrap="wrap" gap={3}>
              <Select
                placeholder="Selecione a distribuidora"
                value={fundoId}
                onChange={e => setFundoId(e.target.value)}
                maxW="320px"
                borderColor="brand.200"
                _focus={{ borderColor: 'brand.500' }}
              >
                {data.fundos.map(f => (
                  <option key={f.id} value={f.id}>{f.coNome} ({f.coCodigo})</option>
                ))}
              </Select>
              <input
                type="month"
                value={competencia}
                onChange={e => setCompetencia(e.target.value)}
                style={{ border: '1px solid #CDD4DC', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', color: '#201E1E' }}
              />
              {fundoId && (
                <Button
                  colorScheme="brand"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Imprimir / PDF
                </Button>
              )}
            </HStack>
          </Box>

          {!fundoId && (
            <Box bg="white" borderRadius="xl" p={10} textAlign="center" color="gray.400" border="1px solid #CDD4DC" className="no-print">
              Selecione uma distribuidora para visualizar os relatórios
            </Box>
          )}

          {fundo && (
            <Box id="area-impressao">
              {/* Cabeçalho de impressão */}
              <Box mb={6} pb={4} borderBottom="2px solid #033D60">
                <HStack justify="space-between" flexWrap="wrap" gap={2}>
                  <VStack align="flex-start" spacing={0}>
                    <Text fontWeight={800} fontSize="lg" color="brand.700">
                      Congregação Cristã no Brasil
                    </Text>
                    <Text fontWeight={600} fontSize="md" color="brand.700">{fundo.coNome}</Text>
                    <Text fontSize="sm" color="gray.500">{fundo.coCodigo} · Gopouva — Guarulhos/SP</Text>
                  </VStack>
                  <VStack align="flex-end" spacing={0}>
                    <Text fontWeight={700} fontSize="md" color="brand.700" textTransform="capitalize">
                      {mesNome}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Emitido em {new Date().toLocaleDateString('pt-BR')}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Tabs colorScheme="brand" className="no-print">
                <TabList mb={4}>
                  <Tab>Demonstrativo Mensal</Tab>
                  <Tab>Inventário</Tab>
                  <Tab>Extrato CC</Tab>
                </TabList>
                <TabPanels>

                  {/* ── Demonstrativo Mensal ── */}
                  <TabPanel px={0}>
                    <DemonstrativoMensal
                      totalVendas={totalVendas}
                      totalVendasPix={totalVendasPix}
                      totalVendasDinheiro={totalVendasDinheiro}
                      totalDepositos={totalDepositos}
                      saldoCC={fundo.contaCorrente}
                      vendasPeriodo={vendasPeriodo}
                      depositosPeriodo={depositosPeriodo}
                    />
                  </TabPanel>

                  {/* ── Inventário ── */}
                  <TabPanel px={0}>
                    <InventarioProdutos estoqueItens={estoqueItens} totalValor={totalEstoqueValor} />
                  </TabPanel>

                  {/* ── Extrato CC ── */}
                  <TabPanel px={0}>
                    <ExtratoCCCompleto extratoSaldo={extratoSaldo} saldoAtual={fundo.contaCorrente} />
                  </TabPanel>

                </TabPanels>
              </Tabs>

              {/* Versão para impressão — todos os relatórios juntos */}
              <Box className="print-only">
                <DemonstrativoMensal
                  totalVendas={totalVendas}
                  totalVendasPix={totalVendasPix}
                  totalVendasDinheiro={totalVendasDinheiro}
                  totalDepositos={totalDepositos}
                  saldoCC={fundo.contaCorrente}
                  vendasPeriodo={vendasPeriodo}
                  depositosPeriodo={depositosPeriodo}
                />
                <Box mt={8} mb={2} borderTop="1px solid #CDD4DC" pt={6}>
                  <InventarioProdutos estoqueItens={estoqueItens} totalValor={totalEstoqueValor} />
                </Box>
                <Box mt={8} mb={2} borderTop="1px solid #CDD4DC" pt={6}>
                  <ExtratoCCCompleto extratoSaldo={extratoSaldo} saldoAtual={fundo.contaCorrente} />
                </Box>

                {/* Assinaturas */}
                <Box mt={12}>
                  <HStack justify="space-around" flexWrap="wrap" gap={8}>
                    {['Responsável pela DL', 'Responsável pela DR'].map(role => (
                      <VStack key={role} spacing={1} align="center">
                        <Box w="200px" borderBottom="1px solid #201E1E" mb={1} />
                        <Text fontSize="xs" color="gray.600">{role}</Text>
                      </VStack>
                    ))}
                  </HStack>
                </Box>
              </Box>
            </Box>
          )}
        </Container>

        {/* Estilos de impressão */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; }
            #area-impressao { padding: 0 !important; }
          }
          @media screen {
            .print-only { display: none !important; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function DemonstrativoMensal({ totalVendas, totalVendasPix, totalVendasDinheiro, totalDepositos, saldoCC, vendasPeriodo, depositosPeriodo }: {
  totalVendas: number; totalVendasPix: number; totalVendasDinheiro: number;
  totalDepositos: number; saldoCC: number;
  vendasPeriodo: any[]; depositosPeriodo: any[];
}) {
  return (
    <VStack spacing={5} align="stretch">
      <Heading size="sm" color="brand.700">Demonstrativo Mensal</Heading>

      <Box bg="brand.50" borderRadius="lg" p={4} border="1px solid #CDD4DC">
        <HStack spacing={8} flexWrap="wrap" gap={4}>
          <Stat size="sm">
            <StatLabel color="gray.500" fontSize="xs">Total de Vendas</StatLabel>
            <StatNumber color="green.600">{formatBRL(totalVendas)}</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel color="gray.500" fontSize="xs">Pix QR Code</StatLabel>
            <StatNumber color="teal.600">{formatBRL(totalVendasPix)}</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel color="gray.500" fontSize="xs">Dinheiro</StatLabel>
            <StatNumber color="brand.700">{formatBRL(totalVendasDinheiro)}</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel color="gray.500" fontSize="xs">Depósitos</StatLabel>
            <StatNumber color="brand.700">{formatBRL(totalDepositos)}</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel color="gray.500" fontSize="xs">Saldo CC</StatLabel>
            <StatNumber color={saldoCC >= 0 ? 'green.600' : 'red.500'}>{formatBRL(saldoCC)}</StatNumber>
          </Stat>
        </HStack>
      </Box>

      {vendasPeriodo.length > 0 && (
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead bg="brand.50">
              <Tr>
                <Th color="brand.700">Data</Th>
                <Th color="brand.700">Produto</Th>
                <Th color="brand.700">Pagamento</Th>
                <Th color="brand.700" isNumeric>Qtd.</Th>
                <Th color="brand.700" isNumeric>Valor</Th>
              </Tr>
            </Thead>
            <Tbody>
              {vendasPeriodo.map(t => (
                <Tr key={t.id} _hover={{ bg: 'brand.50' }}>
                  <Td fontSize="xs" color="gray.500">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</Td>
                  <Td fontSize="xs">[{t.produtoCodigo}] {getProduto(t.produtoCodigo)?.descricao?.slice(0, 40) ?? ''}</Td>
                  <Td><Badge colorScheme={t.payment === 'Pix QR Code' ? 'teal' : 'blue'} fontSize="xs">{t.payment}</Badge></Td>
                  <Td isNumeric>{t.quantity}</Td>
                  <Td isNumeric fontWeight={600} color="green.600">{formatBRL(t.amount)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      {vendasPeriodo.length === 0 && <Text fontSize="sm" color="gray.400">Nenhuma venda no período.</Text>}
    </VStack>
  );
}

function InventarioProdutos({ estoqueItens, totalValor }: { estoqueItens: [string, number][]; totalValor: number }) {
  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="sm" color="brand.700">Inventário de Produtos</Heading>
        <Text fontWeight={700} color="brand.700" fontSize="sm">Valor total: {formatBRL(totalValor)}</Text>
      </HStack>
      {estoqueItens.length === 0 ? (
        <Text fontSize="sm" color="gray.400">Sem itens em estoque.</Text>
      ) : (
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead bg="brand.50">
              <Tr>
                <Th color="brand.700">Código</Th>
                <Th color="brand.700">Descrição</Th>
                <Th color="brand.700" isNumeric>Qtd.</Th>
                <Th color="brand.700" isNumeric>Preço Unit.</Th>
                <Th color="brand.700" isNumeric>Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {estoqueItens.map(([codigo, qty]) => {
                const prod = getProduto(codigo);
                return (
                  <Tr key={codigo} _hover={{ bg: 'brand.50' }}>
                    <Td fontWeight={700} color="brand.700" fontSize="xs">{codigo}</Td>
                    <Td fontSize="xs" color="gray.700">{prod?.descricao ?? codigo}</Td>
                    <Td isNumeric fontWeight={600}>{qty}</Td>
                    <Td isNumeric fontSize="xs" color="gray.600">{formatBRL(prod?.preco ?? 0)}</Td>
                    <Td isNumeric fontWeight={700} color="brand.700">{formatBRL(qty * (prod?.preco ?? 0))}</Td>
                  </Tr>
                );
              })}
              <Tr bg="brand.50">
                <Td colSpan={4} fontWeight={700} color="brand.700">Total em estoque</Td>
                <Td isNumeric fontWeight={800} color="brand.700">{formatBRL(totalValor)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </VStack>
  );
}

function ExtratoCCCompleto({ extratoSaldo, saldoAtual }: { extratoSaldo: { data: string; desc: string; valor: number; saldo: number }[]; saldoAtual: number }) {
  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="sm" color="brand.700">Extrato Conta Corrente</Heading>
        <Text fontWeight={700} color={saldoAtual >= 0 ? 'green.600' : 'red.500'} fontSize="sm">
          Saldo atual: {formatBRL(saldoAtual)}
        </Text>
      </HStack>
      {extratoSaldo.length === 0 ? (
        <Text fontSize="sm" color="gray.400">Sem movimentações.</Text>
      ) : (
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead bg="brand.50">
              <Tr>
                <Th color="brand.700">Data</Th>
                <Th color="brand.700">Descrição</Th>
                <Th color="brand.700" isNumeric>Valor</Th>
                <Th color="brand.700" isNumeric>Saldo</Th>
              </Tr>
            </Thead>
            <Tbody>
              {extratoSaldo.map((l, i) => (
                <Tr key={i} _hover={{ bg: 'brand.50' }}>
                  <Td fontSize="xs" color="gray.500">{new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')}</Td>
                  <Td fontSize="xs" color="gray.700">{l.desc}</Td>
                  <Td isNumeric fontWeight={600} color={l.valor >= 0 ? 'green.600' : 'red.500'}>
                    {l.valor >= 0 ? '+' : ''}{formatBRL(l.valor)}
                  </Td>
                  <Td isNumeric fontWeight={600} color={l.saldo >= 0 ? 'brand.700' : 'red.500'}>
                    {formatBRL(l.saldo)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </VStack>
  );
}
