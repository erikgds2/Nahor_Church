'use client';
import { useState } from 'react';
import {
  Container, Heading, Box, Select, HStack, VStack,
  Text, Badge, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer, Stat, StatLabel, StatNumber, Divider,
  Alert, AlertIcon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';

type Linha = {
  data: string;
  descricao: string;
  tipo: 'deposito' | 'dt';
  valor: number; // positivo = crédito, negativo = débito
  referencia: string;
};

export default function ContaCorrentePage() {
  const { data } = useApp();
  const [fundoId, setFundoId] = useState('');

  const fundo = data.fundos.find(f => f.id === fundoId);

  // Monta extrato cronológico para a DL selecionada
  const extrato: Linha[] = [];

  if (fundoId) {
    // Depósitos (entradas)
    (data.depositos ?? [])
      .filter(d => d.fundoId === fundoId)
      .forEach(d => {
        extrato.push({
          data: d.data,
          descricao: `Depósito — ${d.forma}${d.comprovante ? ` · Comp. ${d.comprovante}` : ''}`,
          tipo: 'deposito',
          valor: d.valor,
          referencia: d.id,
        });
      });

    // DTs aprovadas (saídas — agrupadas por dtId)
    const dtIds = new Set<string>();
    data.orders
      .filter(o => o.fundoId === fundoId && (o.status === 'Aguardando Recebimento' || o.status === 'Regular' || o.status === 'Recusado'))
      .forEach(o => {
        const dtId = o.dtId ?? o.id;
        if (dtIds.has(dtId)) return;
        dtIds.add(dtId);
        const itens = data.orders.filter(x => (x.dtId ?? x.id) === dtId);
        const totalCost = itens.reduce((acc, x) => acc + x.cost, 0);
        const statusLabel = o.status === 'Recusado' ? 'Recusada' : 'Aprovada';
        extrato.push({
          data: (o.processedAt ?? o.requestedAt).slice(0, 10),
          descricao: `DT ${dtId} — ${statusLabel} (${itens.length} item${itens.length > 1 ? 's' : ''})`,
          tipo: 'dt',
          valor: o.status === 'Recusado' ? totalCost : -totalCost, // recusada devolve crédito
          referencia: dtId,
        });
      });

    extrato.sort((a, b) => a.data.localeCompare(b.data));
  }

  // Saldo acumulado linha a linha
  let saldoAcumulado = 0;
  const extratoComSaldo = extrato.map(linha => {
    saldoAcumulado += linha.valor;
    return { ...linha, saldo: saldoAcumulado };
  });

  const totalDepositos = extrato.filter(l => l.tipo === 'deposito').reduce((acc, l) => acc + l.valor, 0);
  const totalDTs = extrato.filter(l => l.tipo === 'dt' && l.valor < 0).reduce((acc, l) => acc + Math.abs(l.valor), 0);

  const saldoAtual = fundo?.contaCorrente ?? 0;
  const alertaBaixoSaldo = saldoAtual < 50 && fundoId;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="1000px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={2}>Conta Corrente</Heading>
          <Text color="gray.500" fontSize="sm" mb={6}>
            Extrato de créditos (depósitos) e débitos (DTs) por distribuidora.
          </Text>

          {/* Seletor de DL */}
          <Box bg="white" borderRadius="xl" p={4} mb={5} boxShadow="0 4px 12px rgba(3,61,96,0.08)" border="1px solid #CDD4DC">
            <Select
              placeholder="Selecione a distribuidora"
              value={fundoId}
              onChange={e => setFundoId(e.target.value)}
              borderColor="brand.200"
              _focus={{ borderColor: 'brand.500' }}
              maxW="400px"
            >
              {data.fundos.map(f => (
                <option key={f.id} value={f.id}>{f.coNome} ({f.coCodigo})</option>
              ))}
            </Select>
          </Box>

          {fundo && (
            <>
              {/* Cards de resumo */}
              <Box bg="brand.700" color="white" borderRadius="xl" p={4} mb={5}>
                <HStack spacing={8} flexWrap="wrap" gap={4}>
                  <Stat>
                    <StatLabel opacity={0.75} fontSize="xs">Saldo disponível</StatLabel>
                    <StatNumber fontSize="2xl" color={saldoAtual >= 0 ? 'green.200' : 'red.200'}>
                      {formatBRL(saldoAtual)}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel opacity={0.75} fontSize="xs">Total depositado</StatLabel>
                    <StatNumber fontSize="xl">{formatBRL(totalDepositos)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel opacity={0.75} fontSize="xs">Total em DTs</StatLabel>
                    <StatNumber fontSize="xl">{formatBRL(totalDTs)}</StatNumber>
                  </Stat>
                </HStack>
              </Box>

              {alertaBaixoSaldo && (
                <Alert status="warning" borderRadius="lg" mb={4}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    Saldo abaixo de R$50,00 — considere registrar um novo depósito.
                  </Text>
                </Alert>
              )}

              {/* Extrato */}
              <Box bg="white" borderRadius="xl" boxShadow="0 8px 24px rgba(3,61,96,0.10)" border="1px solid #CDD4DC" overflow="hidden">
                <Box px={5} py={3} bg="brand.50" borderBottom="1px solid #CDD4DC">
                  <Text fontWeight={700} color="brand.700" fontSize="sm">
                    Extrato — {fundo.coNome}
                  </Text>
                </Box>
                {extratoComSaldo.length === 0 ? (
                  <Box p={8} textAlign="center" color="gray.400">
                    Nenhuma movimentação registrada
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th color="brand.700">Data</Th>
                          <Th color="brand.700">Descrição</Th>
                          <Th color="brand.700">Tipo</Th>
                          <Th color="brand.700" isNumeric>Valor</Th>
                          <Th color="brand.700" isNumeric>Saldo</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {extratoComSaldo.map((linha, i) => (
                          <Tr key={i} _hover={{ bg: 'brand.50' }} transition="background 0.15s">
                            <Td fontSize="xs" color="gray.500">
                              {new Date(linha.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </Td>
                            <Td fontSize="sm" color="gray.700">{linha.descricao}</Td>
                            <Td>
                              <Badge
                                colorScheme={linha.tipo === 'deposito' ? 'green' : linha.valor >= 0 ? 'gray' : 'red'}
                                px={2} py={0.5} borderRadius="md" fontSize="xs"
                              >
                                {linha.tipo === 'deposito' ? 'Depósito' : linha.valor >= 0 ? 'DT Recusada' : 'DT'}
                              </Badge>
                            </Td>
                            <Td isNumeric>
                              <Text fontWeight={700} color={linha.valor >= 0 ? 'green.600' : 'red.500'}>
                                {linha.valor >= 0 ? '+' : ''}{formatBRL(linha.valor)}
                              </Text>
                            </Td>
                            <Td isNumeric>
                              <Text fontWeight={600} color={linha.saldo >= 0 ? 'brand.700' : 'red.500'}>
                                {formatBRL(linha.saldo)}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                        {/* Linha de saldo final */}
                        <Tr bg="brand.50">
                          <Td colSpan={3}>
                            <Text fontWeight={700} fontSize="sm" color="brand.700">Saldo atual</Text>
                          </Td>
                          <Td colSpan={2} isNumeric>
                            <Text fontWeight={800} fontSize="md" color={saldoAtual >= 0 ? 'green.600' : 'red.500'}>
                              {formatBRL(saldoAtual)}
                            </Text>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </>
          )}

          {!fundoId && (
            <Box bg="white" borderRadius="xl" p={10} textAlign="center" color="gray.400" border="1px solid #CDD4DC">
              Selecione uma distribuidora para ver o extrato
            </Box>
          )}
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
