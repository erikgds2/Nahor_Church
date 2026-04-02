'use client';
import { useState } from 'react';
import {
  Container, Heading, Box, Table, Thead, Tbody, Tr, Th, Td,
  Badge, HStack, Select, Input, Text, TableContainer,
  Stat, StatLabel, StatNumber,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { getProdutoLabel } from '@/lib/catalog';

export default function HistoricoPage() {
  const { data } = useApp();

  const [filterFundo, setFilterFundo] = useState('');
  const [filterType, setFilterType] = useState<'venda' | 'reposicao' | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredTransactions = data.transactions
    .filter(t => {
      if (filterFundo && t.fundoId !== filterFundo) return false;
      if (filterType && t.type !== filterType) return false;
      if (fromDate && new Date(t.date) < new Date(fromDate)) return false;
      if (toDate && new Date(t.date) > new Date(toDate + 'T23:59:59')) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getFundoNome = (id: string) => data.fundos.find(f => f.id === id)?.coNome ?? id;

  const totalVendas = filteredTransactions.filter(t => t.type === 'venda').reduce((acc, t) => acc + t.amount, 0);
  const totalReposicoes = filteredTransactions.filter(t => t.type === 'reposicao').reduce((acc, t) => acc + t.amount, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="1200px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={6}>Histórico de Transações</Heading>

          {/* Stats bar */}
          <Box bg="brand.700" color="white" borderRadius="xl" p={4} mb={4}>
            <HStack spacing={8} flexWrap="wrap" gap={4}>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Total de registros</StatLabel>
                <StatNumber fontSize="xl">{filteredTransactions.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Total vendas</StatLabel>
                <StatNumber fontSize="xl" color="green.200">{formatBRL(totalVendas)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Total reposições</StatLabel>
                <StatNumber fontSize="xl" color="red.200">{formatBRL(totalReposicoes)}</StatNumber>
              </Stat>
            </HStack>
          </Box>

          {/* Filtros */}
          <Box bg="white" borderRadius="xl" p={4} mb={4} boxShadow="0 4px 12px rgba(26,58,92,0.08)" border="1px solid #e2ecf5">
            <HStack spacing={3} flexWrap="wrap" gap={2}>
              <Select
                placeholder="Todos os Fundos"
                value={filterFundo}
                onChange={e => setFilterFundo(e.target.value)}
                maxW="220px" size="sm" borderColor="brand.200"
              >
                {data.fundos.map(f => (
                  <option key={f.id} value={f.id}>{f.coNome}</option>
                ))}
              </Select>
              <Select
                placeholder="Todos os tipos"
                value={filterType}
                onChange={e => setFilterType(e.target.value as 'venda' | 'reposicao' | '')}
                maxW="180px" size="sm" borderColor="brand.200"
              >
                <option value="venda">Venda</option>
                <option value="reposicao">Reposição</option>
              </Select>
              <Input
                type="date" placeholder="De" value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                maxW="160px" size="sm" borderColor="brand.200"
              />
              <Input
                type="date" placeholder="Até" value={toDate}
                onChange={e => setToDate(e.target.value)}
                maxW="160px" size="sm" borderColor="brand.200"
              />
            </HStack>
          </Box>

          {/* Tabela */}
          <Box bg="white" borderRadius="xl" boxShadow="0 8px 24px rgba(26,58,92,0.12)" border="1px solid #e2ecf5" overflow="hidden">
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="brand.50">
                  <Tr>
                    <Th color="brand.700">Data</Th>
                    <Th color="brand.700">Fundo Bíblico</Th>
                    <Th color="brand.700">Tipo</Th>
                    <Th color="brand.700">Produto</Th>
                    <Th color="brand.700" isNumeric>Qtd.</Th>
                    <Th color="brand.700">Pagamento</Th>
                    <Th color="brand.700" isNumeric>Valor</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredTransactions.length === 0 ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={8} color="gray.400">
                        Nenhuma transação encontrada
                      </Td>
                    </Tr>
                  ) : (
                    filteredTransactions.map(t => (
                      <Tr key={t.id} _hover={{ bg: 'brand.50' }} transition="background 0.15s">
                        <Td fontSize="xs" color="gray.600">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </Td>
                        <Td fontWeight={500}>{getFundoNome(t.fundoId)}</Td>
                        <Td>
                          <Badge
                            colorScheme={t.type === 'venda' ? 'blue' : 'purple'}
                            px={2} py={0.5} borderRadius="md" textTransform="capitalize"
                          >
                            {t.type === 'venda' ? 'Venda' : 'Reposição'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight={600} fontSize="xs" color="brand.700">[{t.produtoCodigo}]</Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {getProdutoLabel(t.produtoCodigo)}
                          </Text>
                        </Td>
                        <Td isNumeric>{t.quantity}</Td>
                        <Td>
                          {t.payment
                            ? <Text fontSize="xs" color="gray.600">{t.payment}</Text>
                            : <Text fontSize="xs" color="gray.400">—</Text>
                          }
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight={700} color={t.type === 'venda' ? 'green.600' : 'red.500'}>
                            {t.type === 'venda' ? '+' : '-'}{formatBRL(t.amount)}
                          </Text>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
