'use client';
import { useState } from 'react';
import {
  Container,
  Heading,
  Box,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  useToast,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL, getMaterialLabel } from '@/lib/storage';
import { MaterialType, Order, Transaction } from '@/lib/types';

export default function ReposicaoPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [sectorId, setSectorId] = useState('');
  const [material, setMaterial] = useState<MaterialType>('hinario');
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const selectedSector = data.sectors.find(s => s.id === sectorId);
  const unitPrice = data.prices[material];
  const orderCost = qty * unitPrice;
  const availableCredit = selectedSector ? selectedSector.credit : 0;
  const canAfford = availableCredit >= orderCost;
  const deficit = orderCost - availableCredit;

  const handleSubmit = () => {
    if (!sectorId) {
      toast({ title: 'Selecione um setor', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (qty < 1) {
      toast({ title: 'Quantidade inválida', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!canAfford) {
      toast({
        title: 'Crédito insuficiente',
        description: `Faltam ${formatBRL(deficit)} de crédito`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    const sectors = data.sectors.map(s => ({ ...s, stock: { ...s.stock } }));
    const sector = sectors.find(s => s.id === sectorId)!;
    sector.credit -= orderCost;

    const order: Order = {
      id: `o_${Date.now()}`,
      sectorId,
      material,
      quantity: qty,
      cost: orderCost,
      status: 'Pendente',
      requestedAt: new Date().toISOString(),
      processedAt: null,
    };

    const transaction: Transaction = {
      id: `t_${Date.now()}_rep`,
      date: new Date().toISOString(),
      sectorId,
      type: 'reposicao',
      material,
      quantity: qty,
      amount: orderCost,
    };

    updateData({
      ...data,
      sectors,
      orders: [...data.orders, order],
      transactions: [...data.transactions, transaction],
    });

    toast({
      title: 'Pedido de reposição enviado!',
      description: `${qty}x ${getMaterialLabel(material)} — ${formatBRL(orderCost)} debitado do crédito`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    setSectorId('');
    setQty(1);
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="700px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={6}>
            Solicitar Reposição
          </Heading>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Box
              bg="white"
              borderRadius="xl"
              p={6}
              boxShadow="0 8px 24px rgba(26,58,92,0.12)"
              border="1px solid #e2ecf5"
            >
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel color="brand.700" fontWeight={600}>Setor</FormLabel>
                  <Select
                    placeholder="Selecione o setor"
                    value={sectorId}
                    onChange={e => setSectorId(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    {data.sectors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.700" fontWeight={600}>Material</FormLabel>
                  <Select
                    value={material}
                    onChange={e => setMaterial(e.target.value as MaterialType)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    <option value="hinario">Hinário — {formatBRL(data.prices.hinario)}</option>
                    <option value="biblia">Bíblia — {formatBRL(data.prices.biblia)}</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.700" fontWeight={600}>Quantidade</FormLabel>
                  <NumberInput min={1} value={qty} onChange={(_, val) => setQty(val || 1)}>
                    <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Divider />

                {/* Live preview */}
                {sectorId && (
                  <Box
                    bg={canAfford ? 'green.50' : 'red.50'}
                    borderRadius="lg"
                    p={4}
                    border={`1px solid ${canAfford ? '#c6f6d5' : '#fed7d7'}`}
                  >
                    <HStack justify="space-between" flexWrap="wrap" gap={2} mb={2}>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Crédito disponível</StatLabel>
                        <StatNumber color="brand.700" fontSize="lg">{formatBRL(availableCredit)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Custo do pedido</StatLabel>
                        <StatNumber color="brand.700" fontSize="lg">{formatBRL(orderCost)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Saldo após pedido</StatLabel>
                        <StatNumber
                          fontSize="lg"
                          color={canAfford ? 'green.600' : 'red.600'}
                        >
                          {formatBRL(availableCredit - orderCost)}
                        </StatNumber>
                      </Stat>
                    </HStack>

                    {canAfford ? (
                      <HStack>
                        <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                          Aprovado — crédito suficiente
                        </Badge>
                        <Text fontSize="xs" color="green.700">
                          Pedido será criado como Pendente aguardando confirmação
                        </Text>
                      </HStack>
                    ) : (
                      <Alert status="error" borderRadius="md" size="sm">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Crédito insuficiente. Faltam <strong>{formatBRL(deficit)}</strong> para este pedido.
                        </Text>
                      </Alert>
                    )}
                  </Box>
                )}

                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={submitting}
                  isDisabled={!sectorId || !canAfford}
                  mt={2}
                >
                  Solicitar Reposição
                </Button>
              </VStack>
            </Box>
          </motion.div>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
