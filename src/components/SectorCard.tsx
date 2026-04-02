'use client';
import {
  Card, CardHeader, CardBody,
  Heading, Stat, StatLabel, StatNumber,
  Divider, HStack, Badge, VStack, Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FundoBiblico } from '@/lib/types';
import { catalog } from '@/lib/catalog';

interface FundoCardProps {
  fundo: FundoBiblico;
  vendasMes: number;
  formatBRL: (value: number) => string;
}

const MotionCard = motion(Card);

export default function SectorCard({ fundo, vendasMes, formatBRL }: FundoCardProps) {
  const totalItens = Object.values(fundo.estoque).reduce((a, b) => a + b, 0);

  // Monta lista de estoque com descrição curta
  const estoqueItems = Object.entries(fundo.estoque)
    .filter(([, qty]) => qty > 0)
    .map(([codigo, qty]) => {
      const prod = catalog.find(p => p.codigo === codigo);
      const label = prod ? codigo : codigo;
      return { codigo, label, qty };
    });

  return (
    <MotionCard
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(26,58,92,0.2)' }}
      transition={{ duration: 0.2 }}
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="flex-start">
          <Heading size="md" color="brand.700" flex={1}>{fundo.coNome}</Heading>
          <Badge
            colorScheme={fundo.tipo === 'DR' ? 'purple' : 'teal'}
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="md"
            flexShrink={0}
          >
            {fundo.tipo}
          </Badge>
        </HStack>
        <Text fontSize="xs" color="gray.400" mt={0.5}>Cód. {fundo.coCodigo}</Text>
      </CardHeader>
      <CardBody pt={0}>
        <VStack align="stretch" spacing={3}>
          <Stat>
            <StatLabel color="gray.500" fontSize="xs">Conta corrente</StatLabel>
            <StatNumber color="brand.700" fontSize="xl">
              {formatBRL(fundo.contaCorrente)}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.500" fontSize="xs">Vendas no mês</StatLabel>
            <StatNumber color="brand.700" fontSize="xl">
              {formatBRL(vendasMes)}
            </StatNumber>
          </Stat>
          <Divider />
          <VStack align="stretch" spacing={1}>
            <Text fontSize="xs" color="gray.500">{totalItens} itens em estoque</Text>
            <HStack spacing={1} flexWrap="wrap">
              {estoqueItems.slice(0, 5).map(({ codigo, qty }) => (
                <Badge
                  key={codigo}
                  colorScheme="blue"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  variant="subtle"
                >
                  {codigo}: {qty}
                </Badge>
              ))}
              {estoqueItems.length > 5 && (
                <Badge colorScheme="gray" fontSize="xs" px={2} py={0.5} borderRadius="md">
                  +{estoqueItems.length - 5}
                </Badge>
              )}
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );
}
