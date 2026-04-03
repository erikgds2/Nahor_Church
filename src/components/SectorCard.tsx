'use client';
import {
  Card, CardHeader, CardBody,
  Heading, Stat, StatLabel, StatNumber,
  Divider, HStack, Badge, VStack, Text, Box,
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
  const saldoBaixo = fundo.contaCorrente < 50;

  const estoqueItems = Object.entries(fundo.estoque)
    .filter(([, qty]) => qty > 0)
    .map(([codigo, qty]) => ({ codigo, qty }));

  return (
    <MotionCard
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(3,61,96,0.18)' }}
      transition={{ duration: 0.2 }}
      border={saldoBaixo ? '1px solid #FC8181' : '1px solid #CDD4DC'}
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="flex-start">
          <Heading size="md" color="brand.700" flex={1} fontSize={{ base: 'sm', md: 'md' }}>
            {fundo.coNome}
          </Heading>
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
            <HStack spacing={2} align="center">
              <StatNumber color={saldoBaixo ? 'red.500' : 'brand.700'} fontSize="xl">
                {formatBRL(fundo.contaCorrente)}
              </StatNumber>
              {saldoBaixo && (
                <Badge colorScheme="red" fontSize="xs" px={2} py={0.5} borderRadius="md">
                  Saldo baixo
                </Badge>
              )}
            </HStack>
          </Stat>

          <Stat>
            <StatLabel color="gray.500" fontSize="xs">Vendas no mês</StatLabel>
            <StatNumber color="brand.700" fontSize="xl">
              {formatBRL(vendasMes)}
            </StatNumber>
          </Stat>

          <Divider />

          <VStack align="stretch" spacing={1}>
            {totalItens === 0 ? (
              <Text fontSize="xs" color="gray.400" fontStyle="italic">Sem itens em estoque</Text>
            ) : (
              <>
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
              </>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );
}
