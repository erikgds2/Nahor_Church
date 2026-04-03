'use client';
import { useState } from 'react';
import {
  Container, Heading, Box, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, HStack, Select, Text, useToast,
  TableContainer, Stat, StatLabel, StatNumber, VStack, Divider,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { getProdutoLabel } from '@/lib/catalog';
import { OrderStatus } from '@/lib/types';

const statusColors: Record<OrderStatus, string> = {
  Pendente: 'orange',
  'Aguardando Recebimento': 'blue',
  Regular: 'green',
  Recusado: 'red',
};

export default function PedidosPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [filterFundo, setFilterFundo] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');

  const getFundoNome = (id: string) => data.fundos.find(f => f.id === id)?.coNome ?? id;

  // Agrupa orders por dtId
  const dtMap = new Map<string, typeof data.orders>();
  data.orders.forEach(o => {
    const dtId = o.dtId ?? o.id;
    if (!dtMap.has(dtId)) dtMap.set(dtId, []);
    dtMap.get(dtId)!.push(o);
  });

  // Lista de DTs para exibição, filtrada
  const dts = Array.from(dtMap.entries())
    .map(([dtId, items]) => ({
      dtId,
      items,
      fundoId: items[0].fundoId,
      status: items[0].status,
      requestedAt: items[0].requestedAt,
      totalCost: items.reduce((acc, i) => acc + i.cost, 0),
    }))
    .filter(dt => {
      if (filterFundo && dt.fundoId !== filterFundo) return false;
      if (filterStatus && dt.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  // DR aprova → Aguardando Recebimento (sem atualizar estoque ainda)
  const handleApprove = (dtId: string) => {
    const orders = data.orders.map(o =>
      (o.dtId ?? o.id) === dtId && o.status === 'Pendente'
        ? { ...o, status: 'Aguardando Recebimento' as OrderStatus, processedAt: new Date().toISOString() }
        : o
    );
    updateData({ ...data, orders });
    const dt = dtMap.get(dtId)!;
    toast({
      title: 'DT aprovada — aguardando confirmação de recebimento',
      description: `${dt.length} item(s) · ${getFundoNome(dt[0].fundoId)}`,
      status: 'blue' as any, duration: 4000, isClosable: true,
    });
  };

  // DL confirma recebimento → Regular + atualiza estoque
  const handleConfirmReceipt = (dtId: string) => {
    const dtItems = dtMap.get(dtId)!;
    const fundos = data.fundos.map(f => {
      if (f.id !== dtItems[0].fundoId) return f;
      const estoque = { ...f.estoque };
      dtItems.forEach(item => {
        estoque[item.produtoCodigo] = (estoque[item.produtoCodigo] ?? 0) + item.quantity;
      });
      return { ...f, estoque };
    });
    const orders = data.orders.map(o =>
      (o.dtId ?? o.id) === dtId && o.status === 'Aguardando Recebimento'
        ? { ...o, status: 'Regular' as OrderStatus, processedAt: new Date().toISOString() }
        : o
    );
    updateData({ ...data, fundos, orders });
    toast({
      title: 'Recebimento confirmado — estoque atualizado!',
      description: `${dtItems.length} item(s) adicionados ao estoque de ${getFundoNome(dtItems[0].fundoId)}`,
      status: 'success', duration: 4000, isClosable: true,
    });
  };

  // DR recusa → devolve CC
  const handleReject = (dtId: string) => {
    const dtItems = dtMap.get(dtId)!;
    const totalCost = dtItems.reduce((acc, i) => acc + i.cost, 0);
    const fundos = data.fundos.map(f => {
      if (f.id !== dtItems[0].fundoId) return f;
      return { ...f, contaCorrente: f.contaCorrente + totalCost };
    });
    const orders = data.orders.map(o =>
      (o.dtId ?? o.id) === dtId && o.status === 'Pendente'
        ? { ...o, status: 'Recusado' as OrderStatus, processedAt: new Date().toISOString() }
        : o
    );
    updateData({ ...data, fundos, orders });
    toast({
      title: 'DT recusada',
      description: `${formatBRL(totalCost)} devolvido à conta corrente de ${getFundoNome(dtItems[0].fundoId)}`,
      status: 'info', duration: 4000, isClosable: true,
    });
  };

  const pendingCount = dts.filter(dt => dt.status === 'Pendente').length;
  const awaitingCount = dts.filter(dt => dt.status === 'Aguardando Recebimento').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="1200px" px={4} py={6}>
          <HStack justify="space-between" mb={6} flexWrap="wrap" gap={2}>
            <Heading size="lg" color="brand.700">Pedidos — Declarações de Trânsito</Heading>
            <HStack spacing={4}>
              {pendingCount > 0 && (
                <Stat size="sm" textAlign="right">
                  <StatLabel color="orange.500" fontSize="xs">Pendentes</StatLabel>
                  <StatNumber color="orange.500">{pendingCount}</StatNumber>
                </Stat>
              )}
              {awaitingCount > 0 && (
                <Stat size="sm" textAlign="right">
                  <StatLabel color="blue.500" fontSize="xs">Ag. Recebimento</StatLabel>
                  <StatNumber color="blue.500">{awaitingCount}</StatNumber>
                </Stat>
              )}
            </HStack>
          </HStack>

          {/* Fluxo resumido */}
          <Box bg="brand.50" borderRadius="lg" p={3} mb={4} border="1px solid #CDD4DC">
            <HStack spacing={2} flexWrap="wrap" gap={2} fontSize="xs" color="brand.700">
              <Badge colorScheme="orange">Pendente</Badge>
              <Text>→ DR aprova →</Text>
              <Badge colorScheme="blue">Aguardando Recebimento</Badge>
              <Text>→ DL confirma →</Text>
              <Badge colorScheme="green">Regular</Badge>
              <Text color="gray.400" ml={4}>ou</Text>
              <Badge colorScheme="red">Recusado</Badge>
              <Text color="gray.400">(CC devolvido)</Text>
            </HStack>
          </Box>

          {/* Filtros */}
          <Box bg="white" borderRadius="xl" p={4} mb={4} boxShadow="0 4px 12px rgba(3,61,96,0.08)" border="1px solid #CDD4DC">
            <HStack spacing={4} flexWrap="wrap" gap={2}>
              <Select
                placeholder="Todas as distribuidoras"
                value={filterFundo}
                onChange={e => setFilterFundo(e.target.value)}
                maxW="260px" size="sm" borderColor="brand.200"
              >
                {data.fundos.map(f => (
                  <option key={f.id} value={f.id}>{f.coNome}</option>
                ))}
              </Select>
              <Select
                placeholder="Todos os status"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as OrderStatus | '')}
                maxW="220px" size="sm" borderColor="brand.200"
              >
                <option value="Pendente">Pendente</option>
                <option value="Aguardando Recebimento">Aguardando Recebimento</option>
                <option value="Regular">Regular</option>
                <option value="Recusado">Recusado</option>
              </Select>
            </HStack>
          </Box>

          {/* Lista de DTs */}
          <VStack spacing={4} align="stretch">
            {dts.length === 0 ? (
              <Box bg="white" borderRadius="xl" p={8} textAlign="center" color="gray.400" border="1px solid #CDD4DC">
                Nenhuma DT encontrada
              </Box>
            ) : (
              dts.map(dt => (
                <motion.div
                  key={dt.dtId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box bg="white" borderRadius="xl" boxShadow="0 4px 12px rgba(3,61,96,0.08)" border="1px solid #CDD4DC" overflow="hidden">
                    {/* Header da DT */}
                    <HStack
                      justify="space-between"
                      px={5} py={3}
                      bg="brand.50"
                      borderBottom="1px solid #CDD4DC"
                      flexWrap="wrap" gap={2}
                    >
                      <VStack align="flex-start" spacing={0}>
                        <Text fontWeight={700} fontSize="sm" color="brand.700">
                          {dt.dtId}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {getFundoNome(dt.fundoId)} · {new Date(dt.requestedAt).toLocaleDateString('pt-BR')}
                        </Text>
                      </VStack>
                      <HStack spacing={3} flexWrap="wrap" gap={2}>
                        <Text fontWeight={700} color="brand.700">{formatBRL(dt.totalCost)}</Text>
                        <Badge
                          colorScheme={statusColors[dt.status]}
                          px={2} py={1} borderRadius="md" fontSize="xs"
                        >
                          {dt.status}
                        </Badge>

                        {dt.status === 'Pendente' && (
                          <HStack spacing={2}>
                            <Button size="xs" colorScheme="brand" onClick={() => handleApprove(dt.dtId)}>
                              Aprovar
                            </Button>
                            <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleReject(dt.dtId)}>
                              Recusar
                            </Button>
                          </HStack>
                        )}
                        {dt.status === 'Aguardando Recebimento' && (
                          <Button size="xs" colorScheme="green" onClick={() => handleConfirmReceipt(dt.dtId)}>
                            Confirmar Recebimento
                          </Button>
                        )}
                      </HStack>
                    </HStack>

                    {/* Itens da DT */}
                    <TableContainer>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th color="gray.500" fontSize="xs">Código</Th>
                            <Th color="gray.500" fontSize="xs">Produto</Th>
                            <Th color="gray.500" fontSize="xs" isNumeric>Qtd.</Th>
                            <Th color="gray.500" fontSize="xs" isNumeric>Custo</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {dt.items.map(item => (
                            <Tr key={item.id} _hover={{ bg: 'brand.50' }}>
                              <Td fontWeight={600} color="brand.700" fontSize="xs">{item.produtoCodigo}</Td>
                              <Td fontSize="xs" color="gray.600">
                                <Text noOfLines={1}>{getProdutoLabel(item.produtoCodigo)}</Text>
                              </Td>
                              <Td isNumeric>{item.quantity}</Td>
                              <Td isNumeric fontWeight={600} color="brand.700">{formatBRL(item.cost)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                </motion.div>
              ))
            )}
          </VStack>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
