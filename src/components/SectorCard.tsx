'use client';
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  HStack,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Sector } from '@/lib/types';

interface SectorCardProps {
  sector: Sector;
  soldMonth: number;
  formatBRL: (value: number) => string;
}

const MotionCard = motion(Card);

export default function SectorCard({ sector, soldMonth, formatBRL }: SectorCardProps) {
  return (
    <MotionCard
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(26,58,92,0.2)' }}
      transition={{ duration: 0.2 }}
    >
      <CardHeader pb={2}>
        <Heading size="md" color="brand.700">
          {sector.name}
        </Heading>
      </CardHeader>
      <CardBody pt={0}>
        <VStack align="stretch" spacing={3}>
          <Stat>
            <StatLabel color="gray.500" fontSize="xs">Saldo de crédito</StatLabel>
            <StatNumber color="brand.700" fontSize="xl">
              {formatBRL(sector.credit)}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="gray.500" fontSize="xs">Vendas no mês</StatLabel>
            <StatNumber color="brand.700" fontSize="xl">
              {formatBRL(soldMonth)}
            </StatNumber>
          </Stat>
          <Divider />
          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="md">
              Hinários: {sector.stock.hinario}
            </Badge>
            <Badge colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="md">
              Bíblias: {sector.stock.biblia}
            </Badge>
          </HStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );
}
