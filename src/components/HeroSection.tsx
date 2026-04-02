'use client';
import dynamic from 'next/dynamic';
import { Box, VStack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

export default function HeroSection() {
  return (
    <Box
      background="linear-gradient(135deg, #0a1828 0%, #1a3a5c 50%, #0d2540 100%)"
      height={{ base: '180px', md: '220px' }}
      position="relative"
      overflow="hidden"
    >
      <HeroCanvas />
      <VStack
        position="absolute"
        inset={0}
        justify="center"
        align="center"
        spacing={1}
        zIndex={1}
        pointerEvents="none"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <Text color="gold.500" fontSize="xl" fontWeight={700} letterSpacing="wider">
            Centro de Distribuição Regional
          </Text>
          <Text color="white" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800}>
            Congregação Cristã no Brasil
          </Text>
          <Text color="whiteAlpha.700" fontSize="sm">
            Guarulhos · SP
          </Text>
        </motion.div>
      </VStack>
    </Box>
  );
}
