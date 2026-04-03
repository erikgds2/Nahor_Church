'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, HStack, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/venda', label: 'Registrar Venda' },
  { href: '/reposicao', label: 'Solicitar DT' },
  { href: '/pedidos', label: 'Pedidos (DT)' },
  { href: '/historico', label: 'Histórico' },
  { href: '/catalogo', label: 'Catálogo' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      bg="white"
      borderBottom="1px solid #dce8f4"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={100}
    >
      <HStack
        overflowX="auto"
        gap={2}
        px={4}
        py={3}
        maxW="1200px"
        mx="auto"
        css={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <MotionButton
                variant={isActive ? 'solid' : 'ghost'}
                colorScheme="brand"
                size="sm"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
              >
                {item.label}
              </MotionButton>
            </Link>
          );
        })}
      </HStack>
    </Box>
  );
}
