'use client';
import { Box, Text, Button } from '@chakra-ui/react';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { resetAppData } = useApp();

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
      resetAppData();
    }
  };

  return (
    <Box
      as="footer"
      bg="white"
      borderTop="1px solid #dce8f4"
      mt={8}
      py={4}
      textAlign="center"
    >
      <Text color="gray.500" fontSize="sm">
        Centro de Distribuição Regional — CCB
      </Text>
      <Button
        variant="outline"
        colorScheme="red"
        size="xs"
        mt={2}
        onClick={handleReset}
      >
        Resetar dados
      </Button>
      <Text color="gray.400" fontSize="xs" mt={1}>
        // Integração SIGA e Recode/Pix via API — Fase 2
      </Text>
    </Box>
  );
}
