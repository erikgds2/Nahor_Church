'use client';
import {
  Box, Container, Heading, Grid, Stat, StatLabel, StatNumber,
  HStack, VStack, Text, Divider, Badge, Alert, AlertIcon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL, computeVendasMes } from '@/lib/storage';
import SectorCard from '@/components/SectorCard';

export default function DashboardPage() {
  const { data } = useApp();

  const dr = data.fundos.find(f => f.tipo === 'DR');
  const dls = data.fundos.filter(f => f.tipo === 'DL');

  const totalCC = dls.reduce((acc, f) => acc + f.contaCorrente, 0);
  const totalItens = data.fundos.reduce(
    (acc, f) => acc + Object.values(f.estoque).reduce((a, b) => a + b, 0), 0
  );
  const totalVendasMes = data.fundos.reduce(
    (acc, f) => acc + computeVendasMes(f.id, data.transactions), 0
  );

  const pendentes = data.orders.filter(o => o.status === 'Pendente').length;
  const aguardando = data.orders.filter(o => o.status === 'Aguardando Recebimento').length;
  const dlsSaldoBaixo = dls.filter(f => f.contaCorrente < 50);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="1200px" px={4} py={6}>

          {/* Alertas contextuais */}
          {(pendentes > 0 || aguardando > 0 || dlsSaldoBaixo.length > 0) && (
            <VStack spacing={2} mb={5} align="stretch">
              {pendentes > 0 && (
                <Alert status="warning" borderRadius="lg" py={2}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    <strong>{pendentes} DT{pendentes > 1 ? 's' : ''} pendente{pendentes > 1 ? 's' : ''}</strong> aguardando aprovação da DR.
                  </Text>
                </Alert>
              )}
              {aguardando > 0 && (
                <Alert status="info" borderRadius="lg" py={2}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    <strong>{aguardando} DT{aguardando > 1 ? 's' : ''}</strong> aguardando confirmação de recebimento pela DL.
                  </Text>
                </Alert>
              )}
              {dlsSaldoBaixo.map(f => (
                <Alert key={f.id} status="error" borderRadius="lg" py={2}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    <strong>{f.coNome}</strong> com saldo baixo: {formatBRL(f.contaCorrente)}. Registre um depósito.
                  </Text>
                </Alert>
              ))}
            </VStack>
          )}

          {/* ── Bloco DR ─────────────────────────────────────────── */}
          {dr && (
            <Box mb={7}>
              <HStack mb={3} spacing={2}>
                <Heading size="md" color="brand.700">Distribuidora Regional</Heading>
                <Badge colorScheme="purple" px={2} py={0.5} borderRadius="md">DR</Badge>
              </HStack>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={5}>
                <SectorCard
                  fundo={dr}
                  vendasMes={computeVendasMes(dr.id, data.transactions)}
                  formatBRL={formatBRL}
                />

                {/* Card de resumo operacional DR */}
                <Box
                  bg="white"
                  borderRadius="xl"
                  p={5}
                  boxShadow="0 4px 16px rgba(3,61,96,0.08)"
                  border="1px solid #CDD4DC"
                >
                  <Text fontWeight={700} color="brand.700" fontSize="sm" mb={3}>Operações em aberto</Text>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">DTs pendentes</Text>
                      <Badge colorScheme={pendentes > 0 ? 'orange' : 'gray'} fontSize="sm" px={2}>
                        {pendentes}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Ag. recebimento</Text>
                      <Badge colorScheme={aguardando > 0 ? 'blue' : 'gray'} fontSize="sm" px={2}>
                        {aguardando}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Total de DTs</Text>
                      <Badge colorScheme="gray" fontSize="sm" px={2}>
                        {data.orders.filter((o, i, arr) => arr.findIndex(x => (x.dtId ?? x.id) === (o.dtId ?? o.id)) === i).length}
                      </Badge>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Depósitos registrados</Text>
                      <Badge colorScheme="teal" fontSize="sm" px={2}>
                        {(data.depositos ?? []).length}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Fechamentos</Text>
                      <Badge colorScheme="green" fontSize="sm" px={2}>
                        {(data.fechamentos ?? []).length}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>
              </Grid>
            </Box>
          )}

          <Divider mb={7} />

          {/* ── Bloco DLs ─────────────────────────────────────────── */}
          <Box mb={7}>
            <HStack mb={3} spacing={2}>
              <Heading size="md" color="brand.700">Distribuidoras Locais</Heading>
              <Badge colorScheme="teal" px={2} py={0.5} borderRadius="md">DL</Badge>
            </HStack>

            {/* Resumo consolidado DLs */}
            <Box bg="brand.700" color="white" borderRadius="xl" p={4} mb={5}>
              <Text fontSize="xs" fontWeight={600} mb={3} opacity={0.8}>Consolidado — todas as DLs</Text>
              <HStack spacing={8} flexWrap="wrap" gap={4}>
                <Stat>
                  <StatLabel opacity={0.75} fontSize="xs">Conta Corrente Total</StatLabel>
                  <StatNumber fontSize="xl">{formatBRL(totalCC)}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel opacity={0.75} fontSize="xs">Vendas no Mês</StatLabel>
                  <StatNumber fontSize="xl">{formatBRL(totalVendasMes)}</StatNumber>
                </Stat>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="xs" opacity={0.75}>Itens em Estoque (total)</Text>
                  <Text fontWeight={700} fontSize="lg">{totalItens} unidades</Text>
                </VStack>
              </HStack>
            </Box>

            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={5}
            >
              {dls.map(fundo => (
                <SectorCard
                  key={fundo.id}
                  fundo={fundo}
                  vendasMes={computeVendasMes(fundo.id, data.transactions)}
                  formatBRL={formatBRL}
                />
              ))}
            </Grid>
          </Box>

          {/* ── Rodapé de stats ──────────────────────────────────── */}
          <Box bg="white" borderRadius="xl" p={4} boxShadow="0 4px 12px rgba(3,61,96,0.06)" border="1px solid #CDD4DC">
            <Heading size="sm" color="brand.700" mb={4}>Totais do sistema</Heading>
            <Divider mb={4} />
            <HStack spacing={8} flexWrap="wrap" gap={4}>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Distribuidoras</StatLabel>
                <StatNumber color="brand.700">{data.fundos.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Transações</StatLabel>
                <StatNumber color="brand.700">{data.transactions.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">DTs emitidas</StatLabel>
                <StatNumber color="brand.700">
                  {data.orders.filter((o, i, arr) => arr.findIndex(x => (x.dtId ?? x.id) === (o.dtId ?? o.id)) === i).length}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Depósitos</StatLabel>
                <StatNumber color="brand.700">{(data.depositos ?? []).length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Fechamentos</StatLabel>
                <StatNumber color="brand.700">{(data.fechamentos ?? []).length}</StatNumber>
              </Stat>
            </HStack>
          </Box>

        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
