'use client';
import { useState, useMemo } from 'react';
import {
  Container, Heading, Box, FormControl, FormLabel,
  Select, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Button, VStack, HStack, Text, Alert, AlertIcon,
  useToast, Divider, Stat, StatLabel, StatNumber, Badge,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton,
  Input,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { catalog, categoriaLabel, getProduto } from '@/lib/catalog';
import { Order, Transaction } from '@/lib/types';

interface CartItem {
  produtoCodigo: string;
  descricao: string;
  qty: number;
  preco: number;
}

export default function ReposicaoPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [fundoId, setFundoId] = useState('');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [produtoCodigo, setProdutoCodigo] = useState('');
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);

  const fundo = data.fundos.find(f => f.id === fundoId);

  const produtosFiltrados = useMemo(() => {
    return catalog.filter(p => {
      const matchCat = categoria ? p.categoria === categoria : true;
      const matchBusca = busca
        ? p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
          p.descricao.toLowerCase().includes(busca.toLowerCase())
        : true;
      return matchCat && matchBusca;
    });
  }, [categoria, busca]);

  const produto = getProduto(produtoCodigo);

  const totalCarrinho = cart.reduce((acc, item) => acc + item.qty * item.preco, 0);
  const contaCorrente = fundo?.contaCorrente ?? 0;
  const saldoApos = contaCorrente - totalCarrinho;
  const canAfford = saldoApos >= 0;

  const handleAddToCart = () => {
    if (!produtoCodigo || !produto) return;
    const existing = cart.find(c => c.produtoCodigo === produtoCodigo);
    if (existing) {
      setCart(cart.map(c =>
        c.produtoCodigo === produtoCodigo ? { ...c, qty: c.qty + qty } : c
      ));
    } else {
      setCart([...cart, {
        produtoCodigo,
        descricao: produto.descricao,
        qty,
        preco: produto.preco,
      }]);
    }
    setProdutoCodigo('');
    setQty(1);
  };

  const handleRemove = (codigo: string) => {
    setCart(cart.filter(c => c.produtoCodigo !== codigo));
  };

  const handleSubmit = () => {
    if (!fundoId) {
      toast({ title: 'Selecione a distribuidora', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (cart.length === 0) {
      toast({ title: 'Carrinho vazio', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!canAfford) {
      toast({
        title: 'Conta corrente insuficiente',
        description: `Faltam ${formatBRL(-saldoApos)}`,
        status: 'error', duration: 4000, isClosable: true,
      });
      return;
    }

    const dtId = `DT-${Date.now()}`;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    const fundos = data.fundos.map(f => {
      if (f.id !== fundoId) return f;
      return { ...f, contaCorrente: f.contaCorrente - totalCarrinho };
    });

    const newOrders: Order[] = cart.map(item => ({
      id: `o_${Date.now()}_${item.produtoCodigo}`,
      dtId,
      fundoId,
      produtoCodigo: item.produtoCodigo,
      quantity: item.qty,
      cost: item.qty * item.preco,
      status: 'Pendente',
      requestedAt: now,
      processedAt: null,
    }));

    const newTransactions: Transaction[] = cart.map(item => ({
      id: `t_${Date.now()}_${item.produtoCodigo}`,
      date: today,
      fundoId,
      type: 'reposicao',
      produtoCodigo: item.produtoCodigo,
      quantity: item.qty,
      amount: item.qty * item.preco,
    }));

    updateData({
      ...data,
      fundos,
      orders: [...data.orders, ...newOrders],
      transactions: [...data.transactions, ...newTransactions],
    });

    toast({
      title: `DT enviada com ${cart.length} item(s)!`,
      description: `${formatBRL(totalCarrinho)} debitado da conta corrente`,
      status: 'success', duration: 5000, isClosable: true,
    });

    setFundoId('');
    setBusca('');
    setCategoria('');
    setProdutoCodigo('');
    setQty(1);
    setCart([]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="800px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={2}>Solicitar DT — Declaração de Trânsito</Heading>
          <Text color="gray.500" fontSize="sm" mb={6}>
            Selecione a distribuidora, adicione os produtos desejados e envie o pedido à DR.
          </Text>

          <Box bg="white" borderRadius="xl" p={6} boxShadow="0 8px 24px rgba(3,61,96,0.10)" border="1px solid #CDD4DC">
            <VStack spacing={5} align="stretch">

              {/* Distribuidora */}
              <FormControl isRequired>
                <FormLabel color="brand.700" fontWeight={600}>Distribuidora solicitante</FormLabel>
                <Select
                  placeholder="Selecione a DL"
                  value={fundoId}
                  onChange={e => setFundoId(e.target.value)}
                  borderColor="brand.200"
                  _focus={{ borderColor: 'brand.500' }}
                >
                  {data.fundos.filter(f => f.tipo === 'DL').map(f => (
                    <option key={f.id} value={f.id}>{f.coNome} ({f.coCodigo})</option>
                  ))}
                </Select>
                {fundo && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Conta corrente disponível: <strong>{formatBRL(fundo.contaCorrente)}</strong>
                  </Text>
                )}
              </FormControl>

              <Divider />

              {/* Busca de produto */}
              <Heading size="sm" color="brand.700">Adicionar produto</Heading>

              <HStack align="flex-end" flexWrap="wrap" gap={3}>
                <FormControl maxW="200px">
                  <FormLabel color="gray.600" fontSize="sm">Categoria</FormLabel>
                  <Select
                    placeholder="Todas"
                    value={categoria}
                    onChange={e => { setCategoria(e.target.value); setProdutoCodigo(''); }}
                    size="sm" borderColor="brand.200"
                  >
                    {Object.entries(categoriaLabel).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl flex={1} minW="160px">
                  <FormLabel color="gray.600" fontSize="sm">Buscar (código ou nome)</FormLabel>
                  <Input
                    size="sm"
                    placeholder="HC-102P, Bíblia..."
                    value={busca}
                    onChange={e => { setBusca(e.target.value); setProdutoCodigo(''); }}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </FormControl>
              </HStack>

              <HStack align="flex-end" flexWrap="wrap" gap={3}>
                <FormControl flex={1} minW="200px">
                  <FormLabel color="gray.600" fontSize="sm">Produto</FormLabel>
                  <Select
                    placeholder="Selecione o produto"
                    value={produtoCodigo}
                    onChange={e => setProdutoCodigo(e.target.value)}
                    size="sm" borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    {produtosFiltrados.map(p => (
                      <option key={p.codigo} value={p.codigo}>
                        [{p.codigo}] {p.descricao} — {formatBRL(p.preco)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW="120px">
                  <FormLabel color="gray.600" fontSize="sm">Quantidade</FormLabel>
                  <NumberInput min={1} value={qty} onChange={(_, v) => setQty(v || 1)} size="sm">
                    <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Button
                  colorScheme="brand"
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCart}
                  isDisabled={!produtoCodigo}
                  alignSelf="flex-end"
                >
                  + Adicionar
                </Button>
              </HStack>

              {/* Carrinho */}
              {cart.length > 0 && (
                <>
                  <Divider />
                  <Heading size="sm" color="brand.700">Itens da DT</Heading>
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead bg="brand.50">
                        <Tr>
                          <Th color="brand.700">Código</Th>
                          <Th color="brand.700">Descrição</Th>
                          <Th color="brand.700" isNumeric>Qtd.</Th>
                          <Th color="brand.700" isNumeric>Unit.</Th>
                          <Th color="brand.700" isNumeric>Total</Th>
                          <Th />
                        </Tr>
                      </Thead>
                      <Tbody>
                        {cart.map(item => (
                          <Tr key={item.produtoCodigo}>
                            <Td fontWeight={600} color="brand.700" fontSize="xs">{item.produtoCodigo}</Td>
                            <Td fontSize="xs" color="gray.700" maxW="240px">
                              <Text noOfLines={1}>{item.descricao}</Text>
                            </Td>
                            <Td isNumeric>{item.qty}</Td>
                            <Td isNumeric>{formatBRL(item.preco)}</Td>
                            <Td isNumeric fontWeight={700}>{formatBRL(item.qty * item.preco)}</Td>
                            <Td>
                              <IconButton
                                aria-label="Remover"
                                icon={<DeleteIcon />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleRemove(item.produtoCodigo)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>

                  {/* Preview financeiro */}
                  {fundoId && (
                    <Box
                      bg={canAfford ? 'green.50' : 'red.50'}
                      borderRadius="lg" p={4}
                      border={`1px solid ${canAfford ? '#c6f6d5' : '#fed7d7'}`}
                    >
                      <HStack justify="space-between" flexWrap="wrap" gap={4} mb={3}>
                        <Stat size="sm">
                          <StatLabel color="gray.500" fontSize="xs">Conta corrente</StatLabel>
                          <StatNumber color="brand.700" fontSize="lg">{formatBRL(contaCorrente)}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel color="gray.500" fontSize="xs">Total da DT</StatLabel>
                          <StatNumber color="brand.700" fontSize="lg">{formatBRL(totalCarrinho)}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel color="gray.500" fontSize="xs">Saldo após envio</StatLabel>
                          <StatNumber fontSize="lg" color={canAfford ? 'green.600' : 'red.600'}>
                            {formatBRL(saldoApos)}
                          </StatNumber>
                        </Stat>
                      </HStack>
                      {canAfford ? (
                        <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                          Saldo suficiente — DT será enviada como Pendente
                        </Badge>
                      ) : (
                        <Alert status="error" borderRadius="md" size="sm">
                          <AlertIcon />
                          <Text fontSize="sm">
                            Conta corrente insuficiente. Faltam <strong>{formatBRL(-saldoApos)}</strong>.
                          </Text>
                        </Alert>
                      )}
                    </Box>
                  )}

                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={handleSubmit}
                    isDisabled={!fundoId || cart.length === 0 || !canAfford}
                    mt={2}
                  >
                    Enviar DT à DR ({cart.length} {cart.length === 1 ? 'item' : 'itens'} · {formatBRL(totalCarrinho)})
                  </Button>
                </>
              )}

            </VStack>
          </Box>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
