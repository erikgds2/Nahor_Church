'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, HStack, Button, IconButton, VStack, Collapse, Text,
  useDisclosure, Divider,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const navGroups = [
  {
    label: 'Operações',
    items: [
      { href: '/', label: 'Dashboard' },
      { href: '/venda', label: 'Registrar Venda' },
      { href: '/reposicao', label: 'Solicitar DT' },
      { href: '/pedidos', label: 'Pedidos (DT)' },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/deposito', label: 'Depósito' },
      { href: '/conta-corrente', label: 'Conta Corrente' },
      { href: '/fechamento', label: 'Fechamento' },
      { href: '/relatorios', label: 'Relatórios' },
    ],
  },
  {
    label: 'Consulta',
    items: [
      { href: '/historico', label: 'Histórico' },
      { href: '/catalogo', label: 'Catálogo' },
    ],
  },
];

const allItems = navGroups.flatMap(g => g.items);

export default function Navigation() {
  const pathname = usePathname();
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <Box
      as="nav"
      bg="white"
      borderBottom="1px solid #CDD4DC"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={100}
    >
      {/* Desktop — barra horizontal */}
      <HStack
        display={{ base: 'none', md: 'flex' }}
        overflowX="auto"
        gap={1}
        px={4}
        py={2}
        maxW="1200px"
        mx="auto"
        css={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
      >
        {allItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <MotionButton
                variant={isActive ? 'solid' : 'ghost'}
                colorScheme="brand"
                size="sm"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
                fontSize="xs"
              >
                {item.label}
              </MotionButton>
            </Link>
          );
        })}
      </HStack>

      {/* Mobile — hambúrguer */}
      <HStack
        display={{ base: 'flex', md: 'none' }}
        justify="space-between"
        px={4}
        py={3}
      >
        <Text fontWeight={700} fontSize="sm" color="brand.700">
          {allItems.find(i => i.href === pathname)?.label ?? 'Menu'}
        </Text>
        <IconButton
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          icon={isOpen ? <CloseIcon boxSize={3} /> : <HamburgerIcon />}
          variant="ghost"
          colorScheme="brand"
          size="sm"
          onClick={onToggle}
        />
      </HStack>

      {/* Mobile — menu expandido */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          display={{ base: 'block', md: 'none' }}
          bg="white"
          borderTop="1px solid #CDD4DC"
          px={4}
          pb={4}
        >
          {navGroups.map((group, gi) => (
            <Box key={group.label} mt={3}>
              <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>
                {group.label}
              </Text>
              <VStack align="stretch" spacing={1}>
                {group.items.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={onClose}>
                      <Button
                        variant={isActive ? 'solid' : 'ghost'}
                        colorScheme="brand"
                        size="sm"
                        w="full"
                        justifyContent="flex-start"
                        fontSize="sm"
                        minH="44px"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </VStack>
              {gi < navGroups.length - 1 && <Divider mt={3} />}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
