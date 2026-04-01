'use client';
import { useState } from 'react';
import {
  Container,
  Heading,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  Select,
  Text,
  useToast,
  TableContainer,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL, getMaterialLabel } from '@/lib/storage';
import { OrderStatus } from '@/lib/types';

const statusColors: Record<OrderStatus, string> = {
  Pendente: 'orange',
  Aprovado: 'green',
  Recusado: 'red',
};

export default function PedidosPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [filterSector, setFilterSector] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');

  const filteredOrders = data.orders.filter(o => {
    if (filterSector && o.sectorId !== filterSector) return false;
    if (filterStatus && o.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const getSectorName = (id: string) => data.sectors.find(s => s.id === id)?.name ?? id;

  const handleApprove = (orderId: string) => {
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return;

    const sectors = data.sectors.map(s => ({ ...s, stock: { ...s.stock } }));
    const sector = sectors.find(s => s.id === order.sectorId);
    if (sector) {
      sector.stock[order.material] += order.quantity;
    }

    const orders = data.orders.map(o =>
      o.id === orderId
        ? { ...o, status: 'Aprovado' as OrderStatus, processedAt: new Date().toISOString() }
        : o
    );

    updateData({ ...data, sectors, orders });

    toast({
      title: 'Pedido aprovado!',
      description: `${order.quantity}x ${getMaterialLabel(order.material)} adicionado ao estoque de ${getSectorName(order.sectorId)}`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  const handleReject = (orderId: string) => {
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return;

    const sectors = data.sectors.map(s => ({ ...s, stock: { ...s.stock } }));
    const sector = sectors.find(s => s.id === order.sectorId);
    if (sector) {
      sector.credit += order.cost;
    }

    const orders = data.orders.map(o =>
      o.id === orderId
        ? { ...o, status: 'Recusado' as OrderStatus, processedAt: new Date().toISOString() }
        : o
    );

    updateData({ ...data, sectors, orders });

    toast({
      title: 'Pedido recusado',
      description: `${formatBRL(order.cost)} reembolsado ao crédito de ${getSectorName(order.sectorId)}`,
      status: 'info',
      duration: 4000,
      isClosable: true,
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
            <Heading size="lg" color="brand.700">
              Pedidos de Reposição
            </Heading>
            {pendingCount > 0 && (
              <Stat size="sm" textAlign="right">
                <StatLabel color="orange.500" fontSize="xs">Pendentes</StatLabel>
                <StatNumber color="orange.500">{pendingCount}</StatNumber>
              </Stat>
            )}
          </HStack>

          {/* Filters */}
          <Box
            bg="white"
            borderRadius="xl"
            p={4}
            mb={4}
            boxShadow="0 4px 12px rgba(26,58,92,0.08)"
            border="1px solid #e2ecf5"
          >
            <HStack spacing={4} flexWrap="wrap" gap={2}>
              <Select
                placeholder="Todos os setores"
                value={filterSector}
                onChange={e => setFilterSector(e.target.value)}
                maxW="220px"
                size="sm"
                borderColor="brand.200"
              >
                {data.sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
              <Select
                placeholder="Todos os status"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as OrderStatus | '')}
                maxW="200px"
                size="sm"
                borderColor="brand.200"
              >
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Recusado">Recusado</option>
              </Select>
            </HStack>
          </Box>

          {/* Table */}
          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="0 8px 24px rgba(26,58,92,0.12)"
            border="1px solid #e2ecf5"
            overflow="hidden"
          >
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="brand.50">
                  <Tr>
                    <Th color="brand.700">Data</Th>
                    <Th color="brand.700">Setor</Th>
                    <Th color="brand.700">Material</Th>
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
                          <Td fontWeight={500}>{getSectorName(order.sectorId)}</Td>
                          <Td>{getMaterialLabel(order.material)}</Td>
                          <Td isNumeric>{order.quantity}</Td>
                          <Td isNumeric fontWeight={600} color="brand.700">
                            {formatBRL(order.cost)}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={statusColors[order.status]}
                              px={2}
                              py={0.5}
                              borderRadius="md"
                            >
                              {order.status}
                            </Badge>
                          </Td>
                          <Td>
                            {order.status === 'Pendente' && (
                              <HStack spacing={2}>
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  onClick={() => handleApprove(order.id)}
                                >
                                  Aprovar
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => handleReject(order.id)}
                                >
                                  Recusar
                                </Button>
                              </HStack>
                            )}
                            {order.status !== 'Pendente' && (
                              <Text fontSize="xs" color="gray.400">
                                {order.processedAt
                                  ? new Date(order.processedAt).toLocaleDateString('pt-BR')
                                  : '--'}
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
