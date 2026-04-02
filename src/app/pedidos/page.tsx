'use client';
import { useState } from 'react';
import {
  Container, Heading, Box, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, HStack, Select, Text, useToast,
  TableContainer, Stat, StatLabel, StatNumber,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { getProdutoLabel } from '@/lib/catalog';
import { OrderStatus } from '@/lib/types';

const statusColors: Record<OrderStatus, string> = {
  Pendente: 'orange',
  Aprovado: 'green',
  Recusado: 'red',
};

export default function PedidosPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [filterFundo, setFilterFundo] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');

  const filteredOrders = data.orders
    .filter(o => {
      if (filterFundo && o.fundoId !== filterFundo) return false;
      if (filterStatus && o.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const getFundoNome = (id: string) => data.fundos.find(f => f.id === id)?.coNome ?? id;

  const handleApprove = (orderId: string) => {
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return;

    const fundos = data.fundos.map(f => ({ ...f, estoque: { ...f.estoque } }));
    const fundo = fundos.find(f => f.id === order.fundoId);
    if (fundo) {
      fundo.estoque[order.produtoCodigo] = (fundo.estoque[order.produtoCodigo] ?? 0) + order.quantity;
    }

    const orders = data.orders.map(o =>
      o.id === orderId
        ? { ...o, status: 'Aprovado' as OrderStatus, processedAt: new Date().toISOString() }
        : o
    );

    updateData({ ...data, fundos, orders });
    toast({
      title: 'Pedido aprovado!',
      description: `${order.quantity}x [${order.produtoCodigo}] adicionado ao estoque de ${getFundoNome(order.fundoId)}`,
      status: 'success', duration: 4000, isClosable: true,
    });
  };

  const handleReject = (orderId: string) => {
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return;

    const fundos = data.fundos.map(f => ({ ...f, estoque: { ...f.estoque } }));
    const fundo = fundos.find(f => f.id === order.fundoId);
    if (fundo) fundo.contaCorrente += order.cost;

    const orders = data.orders.map(o =>
      o.id === orderId
        ? { ...o, status: 'Recusado' as OrderStatus, processedAt: new Date().toISOString() }
        : o
    );

    updateData({ ...data, fundos, orders });
    toast({
      title: 'Pedido recusado',
      description: `${formatBRL(order.cost)} devolvido à conta corrente de ${getFundoNome(order.fundoId)}`,
      status: 'info', duration: 4000, isClosable: true,
    });
  };

  const pendingCount = data.orders.filter(o => o.status === 'Pendente').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="1200px" px={4} py={6}>
          <HStack justify="space-between" mb={6} flexWrap="wrap" gap={2}>
            <Heading size="lg" color="brand.700">Pedidos de Reposição (DT)</Heading>
            {pendingCount > 0 && (
              <Stat size="sm" textAlign="right">
                <StatLabel color="orange.500" fontSize="xs">Pendentes</StatLabel>
                <StatNumber color="orange.500">{pendingCount}</StatNumber>
              </Stat>
            )}
          </HStack>

          {/* Filtros */}
          <Box bg="white" borderRadius="xl" p={4} mb={4} boxShadow="0 4px 12px rgba(26,58,92,0.08)" border="1px solid #e2ecf5">
            <HStack spacing={4} flexWrap="wrap" gap={2}>
              <Select
                placeholder="Todos os Fundos Bíblicos"
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
                maxW="200px" size="sm" borderColor="brand.200"
              >
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Recusado">Recusado</option>
              </Select>
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
                    <Th color="brand.700">Produto</Th>
                    <Th color="brand.700" isNumeric>Qtd.</Th>
                    <Th color="brand.700" isNumeric>Custo</Th>
                    <Th color="brand.700">Status</Th>
                    <Th color="brand.700">Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <AnimatePresence>
                    {filteredOrders.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={8} color="gray.400">
                          Nenhum pedido encontrado
                        </Td>
                      </Tr>
                    ) : (
                      filteredOrders.map(order => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: 'table-row' }}
                        >
                          <Td fontSize="xs" color="gray.600">
                            {new Date(order.requestedAt).toLocaleDateString('pt-BR')}
                          </Td>
                          <Td fontWeight={500}>{getFundoNome(order.fundoId)}</Td>
                          <Td>
                            <Text fontWeight={600} fontSize="xs" color="brand.700">[{order.produtoCodigo}]</Text>
                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                              {getProdutoLabel(order.produtoCodigo)}
                            </Text>
                          </Td>
                          <Td isNumeric>{order.quantity}</Td>
                          <Td isNumeric fontWeight={600} color="brand.700">{formatBRL(order.cost)}</Td>
                          <Td>
                            <Badge colorScheme={statusColors[order.status]} px={2} py={0.5} borderRadius="md">
                              {order.status}
                            </Badge>
                          </Td>
                          <Td>
                            {order.status === 'Pendente' && (
                              <HStack spacing={2}>
                                <Button size="xs" colorScheme="green" onClick={() => handleApprove(order.id)}>
                                  Aprovar
                                </Button>
                                <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleReject(order.id)}>
                                  Recusar
                                </Button>
                              </HStack>
                            )}
                            {order.status !== 'Pendente' && (
                              <Text fontSize="xs" color="gray.400">
                                {order.processedAt ? new Date(order.processedAt).toLocaleDateString('pt-BR') : '--'}
                              </Text>
                            )}
                          </Td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
