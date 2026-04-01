'use client';
import { Box, Container, Heading, Grid, Stat, StatLabel, StatNumber, HStack, VStack, Text, Divider } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatBRL, computeSoldMonth } from '@/lib/storage';
import SectorCard from '@/components/SectorCard';

export default function DashboardPage() {
  const { data } = useApp();

  const totalCredit = data.sectors.reduce((acc, s) => acc + s.credit, 0);
  const totalHinarios = data.sectors.reduce((acc, s) => acc + s.stock.hinario, 0);
  const totalBiblias = data.sectors.reduce((acc, s) => acc + s.stock.biblia, 0);
  const totalSoldMonth = data.sectors.reduce(
    (acc, s) => acc + computeSoldMonth(s.id, data.transactions),
    0
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="1200px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={6}>
            Visão Geral
          </Heading>

          {/* Summary panel */}
          <Box
            bg="brand.700"
            color="white"
            borderRadius="xl"
            p={4}
            mb={6}
          >
            <Text fontSize="sm" fontWeight={600} mb={3} opacity={0.8}>
              Resumo Consolidado — Todos os Setores
            </Text>
            <HStack spacing={8} flexWrap="wrap" gap={4}>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Crédito Total</StatLabel>
                <StatNumber fontSize="xl">{formatBRL(totalCredit)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Vendas no Mês</StatLabel>
                <StatNumber fontSize="xl">{formatBRL(totalSoldMonth)}</StatNumber>
              </Stat>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="xs" opacity={0.75}>Estoque Total</Text>
                <Text fontWeight={700} fontSize="lg">
                  {totalHinarios} Hinários · {totalBiblias} Bíblias
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Sector cards */}
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={6}
            mb={8}
          >
            {data.sectors.map((sector) => (
              <SectorCard
                key={sector.id}
                sector={sector}
                soldMonth={computeSoldMonth(sector.id, data.transactions)}
                formatBRL={formatBRL}
              />
            ))}
          </Grid>

          {/* Stats summary */}
          <Box bg="white" borderRadius="xl" p={4} boxShadow="0 4px 12px rgba(26,58,92,0.08)" border="1px solid #e2ecf5">
            <Heading size="sm" color="brand.700" mb={4}>
              Estatísticas Gerais
            </Heading>
            <Divider mb={4} />
            <HStack spacing={8} flexWrap="wrap" gap={4}>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Total de Transações</StatLabel>
                <StatNumber color="brand.700">{data.transactions.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Pedidos de Reposição</StatLabel>
                <StatNumber color="brand.700">{data.orders.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Pedidos Pendentes</StatLabel>
                <StatNumber color="orange.500">
                  {data.orders.filter(o => o.status === 'Pendente').length}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Preço Hinário</StatLabel>
                <StatNumber color="brand.700">{formatBRL(data.prices.hinario)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">Preço Bíblia</StatLabel>
                <StatNumber color="brand.700">{formatBRL(data.prices.biblia)}</StatNumber>
              </Stat>
            </HStack>
          </Box>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
