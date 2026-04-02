'use client';
import { useState, useMemo } from 'react';
import {
  Container, Heading, Box, FormControl, FormLabel,
  Select, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Button, VStack, HStack, Text, Alert, AlertIcon,
  useToast, Divider, Stat, StatLabel, StatNumber, Badge,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { catalog, categoriaLabel, getProduto } from '@/lib/catalog';
import { Order, Transaction } from '@/lib/types';

export default function ReposicaoPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [fundoId, setFundoId] = useState('');
  const [categoria, setCategoria] = useState('');
  const [produtoCodigo, setProdutoCodigo] = useState('');
  const [qty, setQty] = useState(1);

  const fundo = data.fundos.find(f => f.id === fundoId);
  const produtosFiltrados = useMemo(
    () => categoria ? catalog.filter(p => p.categoria === categoria) : [],
    [categoria]
  );
  const produto = getProduto(produtoCodigo);
  const unitPrice = produto?.preco ?? 0;
  const orderCost = qty * unitPrice;
  const contaCorrente = fundo?.contaCorrente ?? 0;
  const canAfford = contaCorrente >= orderCost;
  const deficit = orderCost - contaCorrente;

  const handleCategoriaChange = (cat: string) => {
    setCategoria(cat);
    setProdutoCodigo('');
  };

  const handleSubmit = () => {
    if (!fundoId) {
      toast({ title: 'Selecione o Fundo Bíblico', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!produtoCodigo) {
      toast({ title: 'Selecione o produto', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (qty < 1) {
      toast({ title: 'Quantidade inválida', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!canAfford) {
      toast({
        title: 'Conta corrente insuficiente',
        description: `Faltam ${formatBRL(deficit)}`,
        status: 'error', duration: 4000, isClosable: true,
      });
      return;
    }

    const fundos = data.fundos.map(f => ({ ...f, estoque: { ...f.estoque } }));
    const f = fundos.find(f => f.id === fundoId)!;
    f.contaCorrente -= orderCost;

    const order: Order = {
      id: `o_${Date.now()}`,
      fundoId,
      produtoCodigo,
      quantity: qty,
      cost: orderCost,
      status: 'Pendente',
      requestedAt: new Date().toISOString(),
      processedAt: null,
    };

    const transaction: Transaction = {
      id: `t_${Date.now()}_rep`,
      date: new Date().toISOString().slice(0, 10),
      fundoId,
      type: 'reposicao',
      produtoCodigo,
      quantity: qty,
      amount: orderCost,
    };

    updateData({ ...data, fundos, orders: [...data.orders, order], transactions: [...data.transactions, transaction] });

    toast({
      title: 'Pedido de reposição enviado!',
      description: `${qty}x [${produtoCodigo}] — ${formatBRL(orderCost)} debitado da conta corrente`,
      status: 'success', duration: 5000, isClosable: true,
    });

    setFundoId('');
    setCategoria('');
    setProdutoCodigo('');
    setQty(1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="700px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={6}>Solicitar Reposição</Heading>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Box bg="white" borderRadius="xl" p={6} boxShadow="0 8px 24px rgba(26,58,92,0.12)" border="1px solid #e2ecf5">
              <VStack spacing={4} align="stretch">

                <FormControl isRequired>
                  <FormLabel color="brand.700" fontWeight={600}>Fundo Bíblico</FormLabel>
                  <Select
                    placeholder="Selecione a Casa de Oração"
                    value={fundoId}
                    onChange={e => setFundoId(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    {data.fundos.map(f => (
                      <option key={f.id} value={f.id}>{f.coNome} ({f.coCodigo})</option>
                    ))}
                  </Select>
                  {fundo && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Conta corrente disponível: <strong>{formatBRL(fundo.contaCorrente)}</strong>
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.700" fontWeight={600}>Categoria</FormLabel>
                  <Select
                    placeholder="Selecione a categoria"
                    value={categoria}
                    onChange={e => handleCategoriaChange(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    {Object.entries(categoriaLabel).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired isDisabled={!categoria}>
                  <FormLabel color="brand.700" fontWeight={600}>Produto</FormLabel>
                  <Select
                    placeholder="Selecione o produto"
                    value={produtoCodigo}
                    onChange={e => setProdutoCodigo(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    {produtosFiltrados.map(p => (
                      <option key={p.codigo} value={p.codigo}>
                        [{p.codigo}] {p.descricao} — {formatBRL(p.preco)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.700" fontWeight={600}>Quantidade</FormLabel>
                  <NumberInput min={1} value={qty} onChange={(_, v) => setQty(v || 1)}>
                    <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Divider />

                {/* Preview financeiro */}
                {fundoId && produtoCodigo && (
                  <Box
                    bg={canAfford ? 'green.50' : 'red.50'}
                    borderRadius="lg" p={4}
                    border={`1px solid ${canAfford ? '#c6f6d5' : '#fed7d7'}`}
                  >
                    <HStack justify="space-between" flexWrap="wrap" gap={2} mb={2}>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Conta corrente</StatLabel>
                        <StatNumber color="brand.700" fontSize="lg">{formatBRL(contaCorrente)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Custo do pedido</StatLabel>
                        <StatNumber color="brand.700" fontSize="lg">{formatBRL(orderCost)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Saldo após pedido</StatLabel>
                        <StatNumber fontSize="lg" color={canAfford ? 'green.600' : 'red.600'}>
                          {formatBRL(contaCorrente - orderCost)}
                        </StatNumber>
                      </Stat>
                    </HStack>
                    {canAfford ? (
                      <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                        Conta corrente suficiente — pedido será criado como Pendente
                      </Badge>
                    ) : (
                      <Alert status="error" borderRadius="md" size="sm">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Conta corrente insuficiente. Faltam <strong>{formatBRL(deficit)}</strong>.
                        </Text>
                      </Alert>
                    )}
                  </Box>
                )}

                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleSubmit}
                  isDisabled={!fundoId || !produtoCodigo || !canAfford}
                  mt={2}
                >
                  Solicitar Reposição (DT)
                </Button>
              </VStack>
            </Box>
          </motion.div>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
