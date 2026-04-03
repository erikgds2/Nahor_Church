'use client';
import { useState, useMemo } from 'react';
import {
  Container, Heading, Box, Select, Input, Button, VStack, HStack,
  Text, Checkbox, Divider, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer, Badge, Stat, StatLabel, StatNumber, Textarea,
  Alert, AlertIcon, useToast,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL, computeVendasMes } from '@/lib/storage';
import { getProduto } from '@/lib/catalog';
import { FechamentoMensal, ItemContagem } from '@/lib/types';

export default function FechamentoPage() {
  const { data, updateData } = useApp();
  const toast = useToast();

  const hoje = new Date();
  const competenciaDefault = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

  const [fundoId, setFundoId] = useState('');
  const [competencia, setCompetencia] = useState(competenciaDefault);
  const [responsavel, setResponsavel] = useState('');
  const [checkEstoque, setCheckEstoque] = useState(false);
  const [checkCaixa, setCheckCaixa] = useState(false);
  const [checkCC, setCheckCC] = useState(false);
  const [contagem, setContagem] = useState<Record<string, number>>({});
  const [observacoes, setObservacoes] = useState('');

  const fundo = data.fundos.find(f => f.id === fundoId);

  // Verifica se já existe fechamento para essa competência/fundo
  const jaFechado = (data.fechamentos ?? []).some(
    f => f.fundoId === fundoId && f.competencia === competencia
  );

  // Itens em estoque no sistema
  const estoqueItens = fundo
    ? Object.entries(fundo.estoque).filter(([, qty]) => qty > 0)
    : [];

  // Cálculos do período
  const [ano, mes] = competencia.split('-').map(Number);

  const totalVendas = data.transactions
    .filter(t => {
      if (t.fundoId !== fundoId || t.type !== 'venda') return false;
      const d = new Date(t.date);
      return d.getFullYear() === ano && d.getMonth() + 1 === mes;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDepositos = (data.depositos ?? [])
    .filter(d => {
      if (d.fundoId !== fundoId) return false;
      const dt = new Date(d.data);
      return dt.getFullYear() === ano && dt.getMonth() + 1 === mes;
    })
    .reduce((acc, d) => acc + d.valor, 0);

  const saldoCC = fundo?.contaCorrente ?? 0;

  // Divergências
  const divergencias = estoqueItens.filter(([codigo]) => {
    const qtdFisica = contagem[codigo] ?? -1;
    return qtdFisica >= 0 && qtdFisica !== fundo!.estoque[codigo];
  });

  const checklistCompleto = checkEstoque && checkCaixa && checkCC && responsavel.trim() !== '';

  const handleSubmit = () => {
    if (!fundoId) {
      toast({ title: 'Selecione a distribuidora', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!checklistCompleto) {
      toast({ title: 'Preencha o checklist e o nome do responsável', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (jaFechado) {
      toast({ title: 'Competência já encerrada', status: 'error', duration: 3000, isClosable: true });
      return;
    }

    const contagemArray: ItemContagem[] = estoqueItens.map(([codigo, qtdSistema]) => ({
      produtoCodigo: codigo,
      qtdSistema,
      qtdFisica: contagem[codigo] ?? qtdSistema,
    }));

    const fechamento: FechamentoMensal = {
      id: `fech_${Date.now()}`,
      fundoId,
      competencia,
      encerradoEm: new Date().toISOString(),
      responsavel: responsavel.trim(),
      checkEstoque,
      checkCaixa,
      checkContaCorrente: checkCC,
      contagem: contagemArray,
      totalVendas,
      totalDepositos,
      saldoCC,
      observacoes: observacoes.trim(),
    };

    updateData({
      ...data,
      fechamentos: [...(data.fechamentos ?? []), fechamento],
    });

    toast({
      title: `Competência ${competencia} encerrada!`,
      description: `${fundo?.coNome} · Resp: ${responsavel}`,
      status: 'success', duration: 5000, isClosable: true,
    });

    setCheckEstoque(false);
    setCheckCaixa(false);
    setCheckCC(false);
    setContagem({});
    setObservacoes('');
    setResponsavel('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="800px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={2}>Fechamento Mensal</Heading>
          <Text color="gray.500" fontSize="sm" mb={6}>
            Encerramento de competência com checklist e conferência de estoque físico.
          </Text>

          <Box bg="white" borderRadius="xl" p={6} boxShadow="0 8px 24px rgba(3,61,96,0.10)" border="1px solid #CDD4DC">
            <VStack spacing={5} align="stretch">

              {/* Seleção */}
              <HStack spacing={4} flexWrap="wrap" gap={3}>
                <Box flex={1} minW="200px">
                  <Text fontWeight={600} color="brand.700" fontSize="sm" mb={1}>Distribuidora</Text>
                  <Select
                    placeholder="Selecione"
                    value={fundoId}
                    onChange={e => { setFundoId(e.target.value); setContagem({}); }}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  >
                    {data.fundos.map(f => (
                      <option key={f.id} value={f.id}>{f.coNome} ({f.coCodigo})</option>
                    ))}
                  </Select>
                </Box>
                <Box maxW="180px">
                  <Text fontWeight={600} color="brand.700" fontSize="sm" mb={1}>Competência</Text>
                  <Input
                    type="month"
                    value={competencia}
                    onChange={e => setCompetencia(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </Box>
                <Box flex={1} minW="160px">
                  <Text fontWeight={600} color="brand.700" fontSize="sm" mb={1}>Responsável</Text>
                  <Input
                    placeholder="Nome do responsável"
                    value={responsavel}
                    onChange={e => setResponsavel(e.target.value)}
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </Box>
              </HStack>

              {jaFechado && (
                <Alert status="warning" borderRadius="lg">
                  <AlertIcon />
                  Esta competência já foi encerrada para esta distribuidora.
                </Alert>
              )}

              {fundo && (
                <>
                  {/* Resumo do período */}
                  <Box bg="brand.700" color="white" borderRadius="lg" p={4}>
                    <Text fontSize="xs" fontWeight={600} opacity={0.75} mb={3}>
                      Resumo — {fundo.coNome} · {competencia}
                    </Text>
                    <HStack spacing={6} flexWrap="wrap" gap={3}>
                      <Stat size="sm">
                        <StatLabel opacity={0.75} fontSize="xs">Vendas no mês</StatLabel>
                        <StatNumber fontSize="lg">{formatBRL(totalVendas)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel opacity={0.75} fontSize="xs">Depósitos no mês</StatLabel>
                        <StatNumber fontSize="lg">{formatBRL(totalDepositos)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel opacity={0.75} fontSize="xs">Saldo CC atual</StatLabel>
                        <StatNumber fontSize="lg" color={saldoCC >= 0 ? 'green.200' : 'red.200'}>
                          {formatBRL(saldoCC)}
                        </StatNumber>
                      </Stat>
                    </HStack>
                  </Box>

                  <Divider />

                  {/* Checklist */}
                  <Box>
                    <Text fontWeight={700} color="brand.700" mb={3}>Checklist de conferência</Text>
                    <VStack align="stretch" spacing={3}>
                      <Checkbox
                        isChecked={checkEstoque}
                        onChange={e => setCheckEstoque(e.target.checked)}
                        colorScheme="brand"
                      >
                        <Text fontSize="sm">Estoque físico conferido</Text>
                      </Checkbox>
                      <Checkbox
                        isChecked={checkCaixa}
                        onChange={e => setCheckCaixa(e.target.checked)}
                        colorScheme="brand"
                      >
                        <Text fontSize="sm">Caixa físico conferido</Text>
                      </Checkbox>
                      <Checkbox
                        isChecked={checkCC}
                        onChange={e => setCheckCC(e.target.checked)}
                        colorScheme="brand"
                      >
                        <Text fontSize="sm">Conta corrente conferida com a DR</Text>
                      </Checkbox>
                    </VStack>
                  </Box>

                  <Divider />

                  {/* Contagem física de estoque */}
                  <Box>
                    <Text fontWeight={700} color="brand.700" mb={1}>Contagem física de estoque</Text>
                    <Text fontSize="xs" color="gray.500" mb={3}>
                      Preencha a quantidade física contada. Deixe em branco para assumir igual ao sistema.
                    </Text>

                    {estoqueItens.length === 0 ? (
                      <Text fontSize="sm" color="gray.400">Sem itens em estoque no sistema.</Text>
                    ) : (
                      <TableContainer>
                        <Table size="sm" variant="simple">
                          <Thead bg="brand.50">
                            <Tr>
                              <Th color="brand.700">Código</Th>
                              <Th color="brand.700">Produto</Th>
                              <Th color="brand.700" isNumeric>Qtd. Sistema</Th>
                              <Th color="brand.700" isNumeric>Qtd. Física</Th>
                              <Th color="brand.700">Status</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {estoqueItens.map(([codigo, qtdSistema]) => {
                              const prod = getProduto(codigo);
                              const qtdFisica = contagem[codigo];
                              const temDivergencia = qtdFisica !== undefined && qtdFisica !== qtdSistema;
                              return (
                                <Tr key={codigo} bg={temDivergencia ? 'red.50' : undefined}>
                                  <Td fontWeight={700} color="brand.700" fontSize="xs">{codigo}</Td>
                                  <Td fontSize="xs" color="gray.700">
                                    <Text noOfLines={1}>{prod?.descricao ?? codigo}</Text>
                                  </Td>
                                  <Td isNumeric fontWeight={600}>{qtdSistema}</Td>
                                  <Td isNumeric>
                                    <Input
                                      type="number"
                                      min={0}
                                      size="xs"
                                      w="80px"
                                      value={qtdFisica ?? ''}
                                      placeholder={String(qtdSistema)}
                                      onChange={e => {
                                        const v = parseInt(e.target.value);
                                        setContagem(prev => ({ ...prev, [codigo]: isNaN(v) ? qtdSistema : v }));
                                      }}
                                      borderColor={temDivergencia ? 'red.400' : 'brand.200'}
                                      textAlign="right"
                                      _focus={{ borderColor: temDivergencia ? 'red.400' : 'brand.500' }}
                                    />
                                  </Td>
                                  <Td>
                                    {temDivergencia ? (
                                      <Badge colorScheme="red" fontSize="xs">
                                        Divergência: {(qtdFisica ?? 0) - qtdSistema > 0 ? '+' : ''}{(qtdFisica ?? 0) - qtdSistema}
                                      </Badge>
                                    ) : qtdFisica !== undefined ? (
                                      <Badge colorScheme="green" fontSize="xs">OK</Badge>
                                    ) : (
                                      <Badge colorScheme="gray" fontSize="xs" variant="outline">Não conferido</Badge>
                                    )}
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}

                    {divergencias.length > 0 && (
                      <Alert status="error" borderRadius="lg" mt={3}>
                        <AlertIcon />
                        <Text fontSize="sm">
                          {divergencias.length} divergência(s) encontrada(s). Verifique antes de encerrar.
                        </Text>
                      </Alert>
                    )}
                  </Box>

                  <Divider />

                  {/* Observações */}
                  <Box>
                    <Text fontWeight={600} color="brand.700" fontSize="sm" mb={1}>Observações (opcional)</Text>
                    <Textarea
                      placeholder="Registre qualquer ocorrência relevante do mês..."
                      value={observacoes}
                      onChange={e => setObservacoes(e.target.value)}
                      borderColor="brand.200"
                      _focus={{ borderColor: 'brand.500' }}
                      rows={3}
                      fontSize="sm"
                    />
                  </Box>

                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={handleSubmit}
                    isDisabled={!checklistCompleto || jaFechado}
                  >
                    Encerrar Competência {competencia}
                  </Button>
                </>
              )}
            </VStack>
          </Box>

          {/* Histórico de fechamentos */}
          {(data.fechamentos ?? []).length > 0 && (
            <Box mt={8}>
              <Heading size="md" color="brand.700" mb={3}>Fechamentos Anteriores</Heading>
              <Box bg="white" borderRadius="xl" boxShadow="0 4px 12px rgba(3,61,96,0.08)" border="1px solid #CDD4DC" overflow="hidden">
                <TableContainer>
                  <Table size="sm" variant="simple">
                    <Thead bg="brand.50">
                      <Tr>
                        <Th color="brand.700">Competência</Th>
                        <Th color="brand.700">Distribuidora</Th>
                        <Th color="brand.700">Responsável</Th>
                        <Th color="brand.700" isNumeric>Vendas</Th>
                        <Th color="brand.700" isNumeric>Depósitos</Th>
                        <Th color="brand.700" isNumeric>Saldo CC</Th>
                        <Th color="brand.700">Encerrado em</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {[...(data.fechamentos ?? [])]
                        .sort((a, b) => b.competencia.localeCompare(a.competencia))
                        .map(f => (
                          <Tr key={f.id} _hover={{ bg: 'brand.50' }}>
                            <Td fontWeight={700} color="brand.700">{f.competencia}</Td>
                            <Td fontSize="sm">{data.fundos.find(fb => fb.id === f.fundoId)?.coNome ?? f.fundoId}</Td>
                            <Td fontSize="sm">{f.responsavel}</Td>
                            <Td isNumeric color="green.600" fontWeight={600}>{formatBRL(f.totalVendas)}</Td>
                            <Td isNumeric fontWeight={600}>{formatBRL(f.totalDepositos)}</Td>
                            <Td isNumeric fontWeight={600} color={f.saldoCC >= 0 ? 'brand.700' : 'red.500'}>
                              {formatBRL(f.saldoCC)}
                            </Td>
                            <Td fontSize="xs" color="gray.500">
                              {new Date(f.encerradoEm).toLocaleDateString('pt-BR')}
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
