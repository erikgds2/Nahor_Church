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
  Input,
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
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL, getMaterialLabel } from '@/lib/storage';
import { MaterialType, PaymentType, Transaction } from '@/lib/types';

export default function VendaPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [sectorId, setSectorId] = useState('');
  const [material, setMaterial] = useState<MaterialType>('hinario');
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState<PaymentType>('Dinheiro');
  const [price, setPrice] = useState(data.prices.hinario);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const handleMaterialChange = (m: MaterialType) => {
    setMaterial(m);
    setPrice(m === 'hinario' ? data.prices.hinario : data.prices.biblia);
  };

  const selectedSector = data.sectors.find(s => s.id === sectorId);
  const totalAmount = qty * price;
  const availableStock = selectedSector ? selectedSector.stock[material] : 0;
  const hasStock = availableStock >= qty;

  const handleSubmit = () => {
    if (!sectorId) {
      toast({ title: 'Selecione um setor', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (qty < 1) {
      toast({ title: 'Quantidade inválida', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!hasStock) {
      toast({
        title: 'Estoque insuficiente',
        description: `Apenas ${availableStock} unidade(s) disponível(is)`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    const sectors = data.sectors.map(s => ({
      ...s,
      stock: { ...s.stock },
    }));

    const sector = sectors.find(s => s.id === sectorId)!;
    sector.stock[material] -= qty;
    sector.credit += totalAmount;

    const transaction: Transaction = {
      id: `t_${Date.now()}`,
      date: new Date(date).toISOString(),
      sectorId,
      type: 'venda',
      payment,
      material,
      quantity: qty,
      amount: totalAmount,
    };

    updateData({
      ...data,
      sectors,
      transactions: [...data.transactions, transaction],
    });

    toast({
      title: 'Venda registrada com sucesso!',
      description: `${qty}x ${getMaterialLabel(material)} — ${formatBRL(totalAmount)} via ${payment}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    setSectorId('');
    setQty(1);
    setPayment('Dinheiro');
    setDate(new Date().toISOString().slice(0, 10));
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
            Registrar Venda
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
                    onChange={e => handleMaterialChange(e.target.value as MaterialType)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    <option value="hinario">Hinário</option>
                    <option value="biblia">Bíblia</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.700" fontWeight={600}>Quantidade</FormLabel>
                  <NumberInput
                    min={1}
                    max={selectedSector ? selectedSector.stock[material] : 999}
                    value={qty}
                    onChange={(_, val) => setQty(val || 1)}
                  >
                    <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {selectedSector && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Estoque disponível: {selectedSector.stock[material]} unidade(s)
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.700" fontWeight={600}>Forma de Pagamento</FormLabel>
                  <Select
                    value={payment}
                    onChange={e => setPayment(e.target.value as PaymentType)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.700" fontWeight={600}>Preço unitário (R$)</FormLabel>
                  <NumberInput
                    min={0}
                    precision={2}
                    value={price}
                    onChange={(_, val) => setPrice(val || 0)}
                  >
                    <NumberInputField borderColor="brand.200" _focus={{ borderColor: 'brand.500' }} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.700" fontWeight={600}>Data da venda</FormLabel>
                  <Input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </FormControl>

                <Divider />

                {/* Preview */}
                {sectorId && (
                  <Box bg="brand.50" borderRadius="lg" p={4}>
                    <HStack justify="space-between" flexWrap="wrap" gap={2}>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Total da venda</StatLabel>
                        <StatNumber color="brand.700" fontSize="lg">{formatBRL(totalAmount)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel color="gray.500" fontSize="xs">Crédito atual do setor</StatLabel>
                        <StatNumber color="brand.700" fontSize="lg">
                          {selectedSector ? formatBRL(selectedSector.credit) : '--'}
                        </StatNumber>
                      </Stat>
                    </HStack>
                    {!hasStock && (
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
                  isLoading={submitting}
                  isDisabled={!sectorId || !hasStock}
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
