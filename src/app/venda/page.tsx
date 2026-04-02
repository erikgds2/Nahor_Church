'use client';
import { useState, useMemo } from 'react';
import {
  Container, Heading, Box, FormControl, FormLabel,
  Select, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Input, Button, VStack, HStack, Text, Alert, AlertIcon,
  useToast, Divider, Stat, StatLabel, StatNumber, Badge,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  IconButton, Tooltip, Kbd,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteIcon, AddIcon, CheckIcon } from '@chakra-ui/icons';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { catalog, getProduto } from '@/lib/catalog';
import { PaymentType, Transaction } from '@/lib/types';

interface CartItem {
  id: string;
  produtoCodigo: string;
  descricao: string;
  qty: number;
  preco: number;
  payment: PaymentType;
}

export default function VendaPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  // ── Cabeçalho do registro (por culto) ──────────────────────────────────────
  const [fundoId, setFundoId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // ── Formulário de adição de item ───────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [produtoCodigo, setProdutoCodigo] = useState('');
  const [qty, setQty] = useState(1);
  const [preco, setPreco] = useState(0);
  const [payment, setPayment] = useState<PaymentType>('Dinheiro');

  // ── Carrinho (itens do culto) ──────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fundo = data.fundos.find(f => f.id === fundoId);

  // Filtra catálogo pelo texto de busca
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return catalog;
    return catalog.filter(
      p =>
        p.codigo.toLowerCase().includes(q) ||
        p.descricao.toLowerCase().includes(q)
    );
  }, [search]);

  // Estoque disponível descontando o que já está no carrinho
  const getEstoqueDisponivel = (codigo: string) => {
    const noFundo = fundo?.estoque[codigo] ?? 0;
    const noCarrinho = cart
      .filter(i => i.produtoCodigo === codigo)
      .reduce((a, b) => a + b.qty, 0);
    return noFundo - noCarrinho;
  };

  const estoqueDisponivel = produtoCodigo ? getEstoqueDisponivel(produtoCodigo) : 0;

  // Totais do carrinho separados por forma de pagamento
  const totalPix = cart
    .filter(i => i.payment === 'Pix QR Code')
    .reduce((acc, i) => acc + i.qty * i.preco, 0);
  const totalDinheiro = cart
    .filter(i => i.payment === 'Dinheiro')
    .reduce((acc, i) => acc + i.qty * i.preco, 0);
  const totalGeral = totalPix + totalDinheiro;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleProdutoChange = (codigo: string) => {
    setProdutoCodigo(codigo);
    const p = getProduto(codigo);
    if (p) setPreco(p.preco);
    else setPreco(0);
  };

  const handleAddItem = () => {
    if (!fundoId) {
      toast({ title: 'Selecione o Fundo Bíblico primeiro', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!produtoCodigo) {
      toast({ title: 'Selecione um produto', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (qty < 1 || preco <= 0) {
      toast({ title: 'Quantidade e preço devem ser maiores que zero', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (estoqueDisponivel < qty) {
      toast({
        title: 'Estoque insuficiente',
        description: `Disponível: ${estoqueDisponivel} unidade(s) — ${qty - estoqueDisponivel} unidade(s) faltando`,
        status: 'error', duration: 4000, isClosable: true,
      });
      return;
    }

    const produto = getProduto(produtoCodigo)!;
    setCart(prev => [
      ...prev,
      {
        id: `ci_${Date.now()}`,
        produtoCodigo,
        descricao: produto.descricao,
        qty,
        preco,
        payment,
      },
    ]);

    // Resetar apenas o formulário de item, manter fundo + data
    setSearch('');
    setProdutoCodigo('');
    setQty(1);
    setPreco(0);
    setPayment('Dinheiro');

    toast({
      title: `[${produtoCodigo}] adicionado`,
      description: `${qty}x — ${formatBRL(qty * preco)} via ${payment}`,
      status: 'success', duration: 2000, isClosable: true,
    });
  };

  const handleRemoveItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const handleConfirm = () => {
    if (!fundoId) {
      toast({ title: 'Selecione o Fundo Bíblico', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (cart.length === 0) {
      toast({ title: 'Adicione pelo menos um produto', status: 'warning', duration: 3000, isClosable: true });
      return;
    }

    setSubmitting(true);

    const fundos = data.fundos.map(f => ({ ...f, estoque: { ...f.estoque } }));
    const f = fundos.find(f => f.id === fundoId)!;
    const transactions: Transaction[] = [];

    for (const item of cart) {
      const estoqueAtual = f.estoque[item.produtoCodigo] ?? 0;
      if (estoqueAtual < item.qty) {
        toast({
          title: `Estoque insuficiente: [${item.produtoCodigo}]`,
          description: `Disponível: ${estoqueAtual}, solicitado: ${item.qty}`,
          status: 'error', duration: 5000, isClosable: true,
        });
        setSubmitting(false);
        return;
      }
      f.estoque[item.produtoCodigo] = estoqueAtual - item.qty;
      f.contaCorrente += item.qty * item.preco;
      transactions.push({
        id: `t_${Date.now()}_${item.id}`,
        date,
        fundoId,
        type: 'venda',
        payment: item.payment,
        produtoCodigo: item.produtoCodigo,
        quantity: item.qty,
        amount: item.qty * item.preco,
      });
    }

    updateData({ ...data, fundos, transactions: [...data.transactions, ...transactions] });

    toast({
      title: `${cart.length} produto(s) registrado(s) com sucesso!`,
      description: `Total: ${formatBRL(totalGeral)} | Pix QR: ${formatBRL(totalPix)} | Dinheiro: ${formatBRL(totalDinheiro)}`,
      status: 'success', duration: 6000, isClosable: true,
    });

    setCart([]);
    setFundoId('');
    setSearch('');
    setProdutoCodigo('');
    setSubmitting(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="900px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={1}>
            Registrar Venda
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={6}>
            Formulário FOR.DIST.01 — Registro de Vendas do Fundo Bíblico
          </Text>

          {/* ── 1. Cabeçalho do culto ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Box bg="white" borderRadius="xl" p={5} mb={4}
              boxShadow="0 4px 14px rgba(26,58,92,0.10)" border="1px solid #e2ecf5"
            >
              <Text fontWeight={700} color="brand.700" fontSize="sm" mb={3}>
                1 — Identificação do Culto
              </Text>
              <HStack spacing={4} flexWrap="wrap" gap={3}>
                <FormControl isRequired flex={2} minW="220px">
                  <FormLabel color="brand.700" fontWeight={600} fontSize="sm">Fundo Bíblico</FormLabel>
                  <Select
                    placeholder="Selecione a Casa de Oração"
                    value={fundoId}
                    onChange={e => setFundoId(e.target.value)}
                    borderColor="brand.200" _focus={{ borderColor: 'brand.500' }}
                  >
                    {data.fundos.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.coNome} — {f.coCodigo}
                      </option>
                    ))}
                  </Select>
                  {fundo && (
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      Conta corrente: <strong>{formatBRL(fundo.contaCorrente)}</strong>
                    </Text>
                  )}
                </FormControl>
                <FormControl isRequired flex={1} minW="160px">
                  <FormLabel color="brand.700" fontWeight={600} fontSize="sm">Data do culto</FormLabel>
                  <Input
                    type="date" value={date}
                    onChange={e => setDate(e.target.value)}
                    borderColor="brand.200" _focus={{ borderColor: 'brand.500' }}
                  />
                </FormControl>
              </HStack>
            </Box>
          </motion.div>

          {/* ── 2. Adicionar item ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <Box bg="white" borderRadius="xl" p={5} mb={4}
              boxShadow="0 4px 14px rgba(26,58,92,0.10)" border="1px solid #e2ecf5"
            >
              <Text fontWeight={700} color="brand.700" fontSize="sm" mb={3}>
                2 — Adicionar Produto ao Registro
              </Text>

              {/* Busca */}
              <FormControl mb={3}>
                <FormLabel color="brand.700" fontWeight={600} fontSize="sm">
                  Buscar produto
                </FormLabel>
                <Input
                  placeholder="Digite o código (HC-102P) ou nome do produto..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setProdutoCodigo(''); setPreco(0); }}
                  borderColor="brand.200"
                  _focus={{ borderColor: 'brand.500' }}
                />
                {search && (
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    {filteredProducts.length} produto(s) encontrado(s)
                  </Text>
                )}
              </FormControl>

              {/* Produto */}
              <FormControl mb={3} isDisabled={filteredProducts.length === 0 && !search}>
                <FormLabel color="brand.700" fontWeight={600} fontSize="sm">Produto</FormLabel>
                <Select
                  placeholder={filteredProducts.length === 0 ? 'Nenhum produto encontrado' : 'Selecione o produto'}
                  value={produtoCodigo}
                  onChange={e => handleProdutoChange(e.target.value)}
                  borderColor="brand.200"
                  _focus={{ borderColor: 'brand.500' }}
                >
                  {filteredProducts.map(p => (
                    <option key={p.codigo} value={p.codigo}>
                      [{p.codigo}]  {p.descricao}  —  {formatBRL(p.preco)}
                    </option>
                  ))}
                </Select>
                {produtoCodigo && fundo && (
                  <Text
                    fontSize="xs"
                    color={estoqueDisponivel > 0 ? 'gray.400' : 'red.500'}
                    mt={1}
                  >
                    Estoque neste FB: {estoqueDisponivel} unidade(s)
                    {estoqueDisponivel === 0 && ' — sem estoque'}
                  </Text>
                )}
              </FormControl>

              <HStack spacing={3} flexWrap="wrap" gap={3} mb={4}>
                {/* Quantidade */}
                <FormControl flex={1} minW="110px">
                  <FormLabel color="brand.700" fontWeight={600} fontSize="sm">Qtd.</FormLabel>
                  <NumberInput
                    min={1}
                    max={estoqueDisponivel || 999}
                    value={qty}
                    onChange={(_, v) => setQty(v || 1)}
                  >
                    <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                {/* Preço unit */}
                <FormControl flex={1} minW="130px">
                  <FormLabel color="brand.700" fontWeight={600} fontSize="sm">Preço unit. (R$)</FormLabel>
                  <NumberInput
                    min={0} precision={2} value={preco}
                    onChange={(_, v) => setPreco(v || 0)}
                  >
                    <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                {/* Pagamento */}
                <FormControl flex={1} minW="160px">
                  <FormLabel color="brand.700" fontWeight={600} fontSize="sm">Pagamento</FormLabel>
                  <Select
                    value={payment}
                    onChange={e => setPayment(e.target.value as PaymentType)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    <option value="Dinheiro">Dinheiro (espécie)</option>
                    <option value="Pix QR Code">Pix QR Code</option>
                  </Select>
                </FormControl>
              </HStack>

              {/* Preview do item */}
              {produtoCodigo && qty > 0 && preco > 0 && (
                <Box bg="brand.50" borderRadius="lg" p={3} mb={4}>
                  <HStack justify="space-between" flexWrap="wrap" gap={2}>
                    <Text fontSize="sm" color="brand.700">
                      <strong>[{produtoCodigo}]</strong> × {qty} × {formatBRL(preco)}
                    </Text>
                    <HStack>
                      <Text fontWeight={700} color="brand.700">{formatBRL(qty * preco)}</Text>
                      <Badge
                        colorScheme={payment === 'Pix QR Code' ? 'green' : 'gray'}
                        px={2} py={0.5} borderRadius="md"
                      >
                        {payment}
                      </Badge>
                    </HStack>
                  </HStack>
                </Box>
              )}

              <Button
                leftIcon={<AddIcon />}
                colorScheme="brand"
                variant="outline"
                onClick={handleAddItem}
                isDisabled={!produtoCodigo || qty < 1 || preco <= 0 || estoqueDisponivel < qty}
                w="full"
              >
                Adicionar ao Registro
              </Button>
            </Box>
          </motion.div>

          {/* ── 3. Itens do culto ──────────────────────────────────────────── */}
          <AnimatePresence>
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box bg="white" borderRadius="xl" mb={4}
                  boxShadow="0 4px 14px rgba(26,58,92,0.10)" border="1px solid #e2ecf5"
                  overflow="hidden"
                >
                  <Box px={5} pt={4} pb={2}>
                    <HStack justify="space-between">
                      <Text fontWeight={700} color="brand.700" fontSize="sm">
                        3 — Itens do Registro ({cart.length})
                      </Text>
                      <Badge colorScheme="blue" px={2} py={0.5} borderRadius="md">
                        {cart.length} produto(s)
                      </Badge>
                    </HStack>
                  </Box>

                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg="brand.50">
                        <Tr>
                          <Th color="brand.700">Cód.</Th>
                          <Th color="brand.700">Produto</Th>
                          <Th color="brand.700" isNumeric>Qtd.</Th>
                          <Th color="brand.700" isNumeric>Preço</Th>
                          <Th color="brand.700" isNumeric>Total</Th>
                          <Th color="brand.700">Pagamento</Th>
                          <Th />
                        </Tr>
                      </Thead>
                      <Tbody>
                        <AnimatePresence>
                          {cart.map(item => (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                              style={{ display: 'table-row' }}
                            >
                              <Td>
                                <Badge colorScheme="blue" fontSize="xs" px={1.5} py={0.5} borderRadius="sm">
                                  {item.produtoCodigo}
                                </Badge>
                              </Td>
                              <Td>
                                <Text fontSize="xs" color="gray.600" noOfLines={2} maxW="200px">
                                  {item.descricao}
                                </Text>
                              </Td>
                              <Td isNumeric fontWeight={600}>{item.qty}</Td>
                              <Td isNumeric color="gray.600">{formatBRL(item.preco)}</Td>
                              <Td isNumeric fontWeight={700} color="brand.700">
                                {formatBRL(item.qty * item.preco)}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={item.payment === 'Pix QR Code' ? 'green' : 'gray'}
                                  fontSize="xs" px={1.5} py={0.5} borderRadius="sm"
                                >
                                  {item.payment === 'Pix QR Code' ? 'Pix QR' : 'Dinheiro'}
                                </Badge>
                              </Td>
                              <Td>
                                <Tooltip label="Remover item">
                                  <IconButton
                                    aria-label="Remover"
                                    icon={<DeleteIcon />}
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleRemoveItem(item.id)}
                                  />
                                </Tooltip>
                              </Td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* ── 4. Totais (FOR.DIST.01 campos 8, 9, 10) ──────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Box bg="brand.700" color="white" borderRadius="xl" p={5} mb={4}>
                    <Text fontWeight={700} fontSize="sm" opacity={0.8} mb={3}>
                      4 — Totais da Venda (FOR.DIST.01)
                    </Text>
                    <HStack spacing={6} flexWrap="wrap" gap={4} justify="space-between">
                      <Stat>
                        <StatLabel opacity={0.75} fontSize="xs">
                          Campo 8 — Total Pix QR Code
                        </StatLabel>
                        <StatNumber fontSize="xl" color="green.300">
                          {formatBRL(totalPix)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel opacity={0.75} fontSize="xs">
                          Campo 9 — Total Dinheiro (espécie)
                        </StatLabel>
                        <StatNumber fontSize="xl" color="yellow.200">
                          {formatBRL(totalDinheiro)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel opacity={0.75} fontSize="xs">
                          Campo 10 — Total Geral
                        </StatLabel>
                        <StatNumber fontSize="2xl">
                          {formatBRL(totalGeral)}
                        </StatNumber>
                      </Stat>
                    </HStack>
                  </Box>

                  {totalDinheiro > 200 && (
                    <Alert status="warning" borderRadius="xl" mb={4}>
                      <AlertIcon />
                      <Text fontSize="sm">
                        O total em dinheiro está acima de <strong>R$ 200,00</strong>.
                        Realize o depósito na conta da DR o quanto antes.
                      </Text>
                    </Alert>
                  )}

                  <Button
                    leftIcon={<CheckIcon />}
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    onClick={handleConfirm}
                    isLoading={submitting}
                    loadingText="Registrando..."
                  >
                    Registrar Venda — {formatBRL(totalGeral)}
                  </Button>
                  <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                    Lançar no SIGA ao menos 1× por semana
                  </Text>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Estado vazio */}
          {cart.length === 0 && fundoId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Box
                borderRadius="xl" p={8} textAlign="center"
                border="2px dashed #cbd5e0" bg="gray.50"
              >
                <Text color="gray.400" fontSize="sm">
                  Nenhum produto adicionado ainda.
                  <br />Use o formulário acima para adicionar itens deste culto.
                </Text>
              </Box>
            </motion.div>
          )}
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
