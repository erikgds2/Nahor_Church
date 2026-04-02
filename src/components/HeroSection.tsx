'use client';
import { Box, VStack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <Box
      background="linear-gradient(135deg, #011e2c 0%, #033D60 50%, #022c41 100%)"
      height={{ base: '140px', md: '170px' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: 'center' }}
      >
        <Text color="gold.500" fontSize={{ base: 'sm', md: 'md' }} fontWeight={700} letterSpacing="widest" textTransform="uppercase" mb={1}>
          Distribuidora Regional · Gopouva
        </Text>
        <Text color="white" fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} lineHeight={1.1}>
          Congregação Cristã no Brasil
        </Text>
        <Text color="whiteAlpha.600" fontSize="sm" mt={1}>
          Guarulhos · SP — Setores 1, 2, 3 e 4
        </Text>
      </motion.div>
    </Box>
  );
}
