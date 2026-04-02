'use client';
import { useState, useMemo } from 'react';
import {
  Container, Heading, Box, FormControl, FormLabel,
  Select, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Input, Button, VStack, HStack, Text, Alert, AlertIcon,
  useToast, Divider, Stat, StatLabel, StatNumber, Badge,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { catalog, categoriaLabel, getProduto } from '@/lib/catalog';
import { PaymentType, Transaction } from '@/lib/types';

export default function VendaPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [fundoId, setFundoId] = useState('');
  const [categoria, setCategoria] = useState('');
  const [produtoCodigo, setProdutoCodigo] = useState('');
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState<PaymentType>('Dinheiro');
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fundo = data.fundos.find(f => f.id === fundoId);
  const produtosFiltrados = useMemo(
    () => categoria ? catalog.filter(p => p.categoria === categoria) : [],
    [categoria]
  );
  const produto = getProduto(produtoCodigo);
  const estoqueDisponivel = fundo ? (fundo.estoque[produtoCodigo] ?? 0) : 0;
  const totalAmount = qty * price;
  const hasStock = estoqueDisponivel >= qty;

  const handleCategoriaChange = (cat: string) => {
    setCategoria(cat);
    setProdutoCodigo('');
    setPrice(0);
  };

  const handleProdutoChange = (codigo: string) => {
    setProdutoCodigo(codigo);
    const p = getProduto(codigo);
    if (p) setPrice(p.preco);
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
    if (qty < 1 || price <= 0) {
      toast({ title: 'Quantidade e preço devem ser maiores que zero', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!hasStock) {
      toast({
        title: 'Estoque insuficiente',
        description: `Apenas ${estoqueDisponivel} unidade(s) em estoque`,
        status: 'error', duration: 4000, isClosable: true,
      });
      return;
    }

    const fundos = data.fundos.map(f => ({
      ...f,
      estoque: { ...f.estoque },
    }));
    const f = fundos.find(f => f.id === fundoId)!;
    f.estoque[produtoCodigo] = (f.estoque[produtoCodigo] ?? 0) - qty;
    f.contaCorrente += totalAmount;

    const transaction: Transaction = {
      id: `t_${Date.now()}`,
      date,
      fundoId,
      type: 'venda',
      payment,
      produtoCodigo,
      quantity: qty,
      amount: totalAmount,
    };

    updateData({ ...data, fundos, transactions: [...data.transactions, transaction] });

    toast({
      title: 'Venda registrada!',
      description: `${qty}x ${produto?.descricao ?? produtoCodigo} — ${formatBRL(totalAmount)} via ${payment}`,
      status: 'success', duration: 5000, isClosable: true,
    });

    setProdutoCodigo('');
    setCategoria('');
    setQty(1);
    setPrice(0);
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="700px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={6}>Registrar Venda</Heading>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Box bg="white" borderRadius="xl" p={6} boxShadow="0 8px 24px rgba(26,58,92,0.12)" border="1px solid #e2ecf5">
              <VStack spacing={4} align="stretch">

                {/* Fundo Bíblico */}
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
                </FormControl>

                {/* Categoria */}
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

                {/* Produto */}
                <FormControl isRequired isDisabled={!categoria}>
                  <FormLabel color="brand.700" fontWeight={600}>Produto</FormLabel>
                  <Select
                    placeholder="Selecione o produto"
                    value={produtoCodigo}
                    onChange={e => handleProdutoChange(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    {produtosFiltrados.map(p => (
                      <option key={p.codigo} value={p.codigo}>
                        [{p.codigo}] {p.descricao} — {formatBRL(p.preco)}
                      </option>
                    ))}
                  </Select>
                  {produtoCodigo && fundo && (
                    <Text fontSize="xs" color={estoqueDisponivel > 0 ? 'gray.500' : 'red.500'} mt={1}>
                      Estoque neste FB: {estoqueDisponivel} unidade(s)
                    </Text>
                  )}
                </FormControl>

                <HStack spacing={4}>
                  {/* Quantidade */}
                  <FormControl isRequired flex={1}>
                    <FormLabel color="brand.700" fontWeight={600}>Qtd.</FormLabel>
                    <NumberInput min={1} max={estoqueDisponivel || 999} value={qty} onChange={(_, v) => setQty(v || 1)}>
                      <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  {/* Preço unitário */}
                  <FormControl flex={1}>
                    <FormLabel color="brand.700" fontWeight={600}>Preço unit. (R$)</FormLabel>
                    <NumberInput min={0} precision={2} value={price} onChange={(_, v) => setPrice(v || 0)}>
                      <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  {/* Pagamento */}
                  <FormControl isRequired flex={1}>
                    <FormLabel color="brand.700" fontWeight={600}>Pagamento</FormLabel>
                    <Select
                      value={payment}
                      onChange={e => setPayment(e.target.value as PaymentType)}
                      borderColor="brand.200"
                      _focus={{ borderColor: 'brand.500' }}
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Pix QR Code">Pix QR Code</option>
                    </Select>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      Apenas dinheiro ou Pix QR Code
                    </Text>
                  </FormControl>

                  {/* Data */}
                  <FormControl flex={1}>
                    <FormLabel color="brand.700" fontWeight={600}>Data</FormLabel>
                    <Input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      borderColor="brand.200"
                      _focus={{ borderColor: 'brand.500' }}
                    />
                  </FormControl>
                </HStack>

                <Divider />

                {/* Preview */}
                {fundoId && produtoCodigo && (
                  <Box bg="brand.50" borderRadius="lg" p={4}>
                    <HStack justify="space-between" flexWrap="wrap" gap={2}>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Total da venda</StatLabel>
                        <StatNumber color="brand.700" fontSize="lg">{formatBRL(totalAmount)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Conta corrente atual</StatLabel>
                        <StatNumber color="brand.700" fontSize="lg">
                          {fundo ? formatBRL(fundo.contaCorrente) : '--'}
                        </StatNumber>
                      </Stat>
                      <Badge colorScheme={payment === 'Dinheiro' ? 'gray' : 'green'} px={2} py={1} borderRadius="md">
                        {payment}
                      </Badge>
                    </HStack>
                    {!hasStock && produtoCodigo && (
                      <Alert status="error" mt={2} borderRadius="md" size="sm">
                        <AlertIcon />
                        Estoque insuficiente para esta quantidade.
                      </Alert>
                    )}
                  </Box>
                )}

                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleSubmit}
                  isDisabled={!fundoId || !produtoCodigo || !hasStock || qty < 1}
                  mt={2}
                >
                  Confirmar Venda
                </Button>
              </VStack>
            </Box>
          </motion.div>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
