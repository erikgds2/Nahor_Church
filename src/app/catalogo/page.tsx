'use client';
import { useState, useMemo } from 'react';
import {
  Container, Heading, Box, Input, Select, HStack, VStack,
  Text, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Stat, StatLabel, StatNumber,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalog, categoriaLabel } from '@/lib/catalog';
import { formatBRL } from '@/lib/storage';

export default function CatalogoPage() {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');

  const categoriaColors: Record<string, string> = {
    hinario_canto: 'blue',
    hinario_musica: 'purple',
    biblia: 'green',
    veu: 'pink',
    metodo: 'orange',
    outro: 'gray',
  };

  const produtosFiltrados = useMemo(() => {
    return catalog.filter(p => {
      const matchCat = categoria ? p.categoria === categoria : true;
      const matchBusca = busca
        ? p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
          p.descricao.toLowerCase().includes(busca.toLowerCase())
        : true;
      return matchCat && matchBusca;
    });
  }, [busca, categoria]);

  const totalProdutos = catalog.length;
  const menorPreco = Math.min(...catalog.map(p => p.preco));
  const maiorPreco = Math.max(...catalog.map(p => p.preco));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container maxW="1000px" px={4} py={6}>
          <Heading size="lg" color="brand.700" mb={2}>Catálogo de Produtos</Heading>
          <Text color="gray.500" fontSize="sm" mb={6}>
            Lista oficial de preços — CCB · Distribuidora de Bíblias e Hinários
          </Text>

          {/* Stats */}
          <Box bg="brand.700" color="white" borderRadius="xl" p={4} mb={5}>
            <HStack spacing={8} flexWrap="wrap" gap={4}>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Total de produtos</StatLabel>
                <StatNumber fontSize="xl">{totalProdutos}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Menor preço</StatLabel>
                <StatNumber fontSize="xl">{formatBRL(menorPreco)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Maior preço</StatLabel>
                <StatNumber fontSize="xl">{formatBRL(maiorPreco)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel opacity={0.75} fontSize="xs">Exibindo</StatLabel>
                <StatNumber fontSize="xl">{produtosFiltrados.length}</StatNumber>
              </Stat>
            </HStack>
          </Box>

          {/* Filtros */}
          <Box bg="white" borderRadius="xl" p={4} mb={4} boxShadow="0 4px 12px rgba(3,61,96,0.08)" border="1px solid #CDD4DC">
            <HStack spacing={3} flexWrap="wrap" gap={2}>
              <Input
                placeholder="Buscar por código ou nome..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                maxW="300px" size="sm" borderColor="brand.200"
                _focus={{ borderColor: 'brand.500' }}
              />
              <Select
                placeholder="Todas as categorias"
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                maxW="220px" size="sm" borderColor="brand.200"
              >
                {Object.entries(categoriaLabel).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </Select>
            </HStack>
          </Box>

          {/* Tabela */}
          <Box bg="white" borderRadius="xl" boxShadow="0 8px 24px rgba(3,61,96,0.10)" border="1px solid #CDD4DC" overflow="hidden">
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="brand.50">
                  <Tr>
                    <Th color="brand.700">Código</Th>
                    <Th color="brand.700">Descrição</Th>
                    <Th color="brand.700">Categoria</Th>
                    <Th color="brand.700" isNumeric>Preço</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {produtosFiltrados.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={8} color="gray.400">
                        Nenhum produto encontrado
                      </Td>
                    </Tr>
                  ) : (
                    produtosFiltrados.map(p => (
                      <Tr key={p.codigo} _hover={{ bg: 'brand.50' }} transition="background 0.15s">
                        <Td>
                          <Text fontWeight={700} color="brand.700" fontSize="sm">{p.codigo}</Text>
                        </Td>
                        <Td fontSize="sm" color="gray.700">{p.descricao}</Td>
                        <Td>
                          <Badge
                            colorScheme={categoriaColors[p.categoria] ?? 'gray'}
                            px={2} py={0.5} borderRadius="md" fontSize="xs"
                          >
                            {categoriaLabel[p.categoria] ?? p.categoria}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight={700} color="brand.700">{formatBRL(p.preco)}</Text>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>

          <Text fontSize="xs" color="gray.400" mt={3} textAlign="center">
            Lista de preços vigente a partir de 01/09/2025 · (11) 3299-0293 · distribuidora.bras@congregacao.org.br
          </Text>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
}
