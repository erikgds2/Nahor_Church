'use client';
import { useState } from 'react';
import {
  Container, Heading, Box, FormControl, FormLabel,
  Select, Input, Button, VStack, HStack, Text,
  useToast, Divider, Stat, StatLabel, StatNumber,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Badge,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL } from '@/lib/storage';
import { Deposito, DepositoForma } from '@/lib/types';

export default function DepositoPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const [fundoId, setFundoId] = useState('');
  const [data_dep, setDataDep] = useState(new Date().toISOString().slice(0, 10));
  const [valor, setValor] = useState('');
  const [forma, setForma] = useState<DepositoForma>('Pix');
  const [comprovante, setComprovante] = useState('');

  const fundo = data.fundos.find(f => f.id === fundoId);
  const valorNum = parseFloat(valor.replace(',', '.')) || 0;

  const handleSubmit = () => {
    if (!fundoId) {
      toast({ title: 'Selecione a distribuidora', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (valorNum <= 0) {
      toast({ title: 'Informe um valor válido', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!data_dep) {
      toast({ title: 'Informe a data do depósito', status: 'warning', duration: 3000, isClosable: true });
      return;
    }

    const novoDeposito: Deposito = {
      id: `dep_${Date.now()}`,
      fundoId,
      data: data_dep,
      valor: valorNum,
      forma,
      comprovante: comprovante.trim(),
      registradoEm: new Date().toISOString(),
    };

    const fundos = data.fundos.map(f =>
      f.id === fundoId
        ? { ...f, contaCorrente: f.contaCorrente + valorNum }
        : f
    );

    updateData({
      ...data,
      fundos,
      depositos: [...(data.depositos ?? []), novoDeposito],
    });

    toast({
      title: 'Depósito registrado!',
      description: `${formatBRL(valorNum)} creditado na conta corrente de ${fundo?.coNome}`,
      status: 'success', duration: 5000, isClosable: true,
    });

    setFundoId('');
    setValor('');
    setForma('Pix');
    setComprovante('');
    setDataDep(new Date().toISOString().slice(0, 10));
  };

  // Histórico de depósitos — mais recentes primeiro
  const depositos = [...(data.depositos ?? [])]
    .sort((a, b) => b.registradoEm.localeCompare(a.registradoEm));

  const getFundoNome = (id: string) => data.fundos.find(f => f.id === id)?.coNome ?? id;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="800px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={2}>Registrar Depósito</Heading>
          <Text color="gray.500" fontSize="sm" mb={6}>
            Registre depósitos feitos pela DL na conta bancária da DR para crédito na conta corrente.
          </Text>

          <Box bg="white" borderRadius="xl" p={6} boxShadow="0 8px 24px rgba(3,61,96,0.10)" border="1px solid #CDD4DC" mb={6}>
            <VStack spacing={4} align="stretch">

              <HStack spacing={4} flexWrap="wrap" gap={3}>
                <FormControl isRequired flex={1} minW="200px">
                  <FormLabel color="brand.700" fontWeight={600}>Distribuidora</FormLabel>
                  <Select
                    placeholder="Selecione a DL"
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
                      Saldo atual: <strong>{formatBRL(fundo.contaCorrente)}</strong>
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired maxW="180px">
                  <FormLabel color="brand.700" fontWeight={600}>Data do depósito</FormLabel>
                  <Input
                    type="date"
                    value={data_dep}
                    onChange={e => setDataDep(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} flexWrap="wrap" gap={3}>
                <FormControl isRequired flex={1} minW="140px">
                  <FormLabel color="brand.700" fontWeight={600}>Valor (R$)</FormLabel>
                  <Input
                    placeholder="0,00"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </FormControl>

                <FormControl isRequired maxW="200px">
                  <FormLabel color="brand.700" fontWeight={600}>Forma</FormLabel>
                  <Select
                    value={forma}
                    onChange={e => setForma(e.target.value as DepositoForma)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    <option value="Pix">Pix</option>
                    <option value="Depósito Bancário">Depósito Bancário</option>
                  </Select>
                </FormControl>

                <FormControl flex={1} minW="160px">
                  <FormLabel color="brand.700" fontWeight={600}>Comprovante</FormLabel>
                  <Input
                    placeholder="Nº ou descrição"
                    value={comprovante}
                    onChange={e => setComprovante(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </FormControl>
              </HStack>

              {/* Preview */}
              {fundoId && valorNum > 0 && (
                <Box bg="green.50" borderRadius="lg" p={4} border="1px solid #c6f6d5">
                  <HStack spacing={8} flexWrap="wrap" gap={4}>
                    <Stat size="sm">
                      <StatLabel color="gray.500" fontSize="xs">Saldo atual</StatLabel>
                      <StatNumber color="brand.700" fontSize="lg">{formatBRL(fundo?.contaCorrente ?? 0)}</StatNumber>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel color="gray.500" fontSize="xs">Depósito</StatLabel>
                      <StatNumber color="green.600" fontSize="lg">+{formatBRL(valorNum)}</StatNumber>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel color="gray.500" fontSize="xs">Saldo após</StatLabel>
                      <StatNumber color="green.600" fontSize="lg">
                        {formatBRL((fundo?.contaCorrente ?? 0) + valorNum)}
                      </StatNumber>
                    </Stat>
                  </HStack>
                </Box>
              )}

              <Divider />

              <Button
                colorScheme="brand"
                size="lg"
                onClick={handleSubmit}
                isDisabled={!fundoId || valorNum <= 0}
              >
                Registrar Depósito
              </Button>
            </VStack>
          </Box>

          {/* Histórico */}
          <Heading size="md" color="brand.700" mb={3}>Histórico de Depósitos</Heading>
          <Box bg="white" borderRadius="xl" boxShadow="0 4px 12px rgba(3,61,96,0.08)" border="1px solid #CDD4DC" overflow="hidden">
            {depositos.length === 0 ? (
              <Box p={8} textAlign="center" color="gray.400">
                Nenhum depósito registrado
              </Box>
            ) : (
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead bg="brand.50">
                    <Tr>
                      <Th color="brand.700">Data</Th>
                      <Th color="brand.700">Distribuidora</Th>
                      <Th color="brand.700">Forma</Th>
                      <Th color="brand.700">Comprovante</Th>
                      <Th color="brand.700" isNumeric>Valor</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {depositos.map(d => (
                      <Tr key={d.id} _hover={{ bg: 'brand.50' }} transition="background 0.15s">
                        <Td fontSize="xs" color="gray.500">
                          {new Date(d.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </Td>
                        <Td fontSize="sm" fontWeight={500}>{getFundoNome(d.fundoId)}</Td>
                        <Td>
                          <Badge
                            colorScheme={d.forma === 'Pix' ? 'teal' : 'blue'}
                            px={2} py={0.5} borderRadius="md" fontSize="xs"
                          >
                            {d.forma}
                          </Badge>
                        </Td>
                        <Td fontSize="xs" color="gray.600">{d.comprovante || '—'}</Td>
                        <Td isNumeric>
                          <Text fontWeight={700} color="green.600">+{formatBRL(d.valor)}</Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
