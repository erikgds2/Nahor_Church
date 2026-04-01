'use client';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ReactNode } from 'react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e8f0f9',
      100: '#c6d9ef',
      200: '#99bade',
      300: '#6d9bcd',
      400: '#4d82bc',
      500: '#2e6aab',
      600: '#2d5c8a',
      700: '#1a3a5c',
      800: '#122840',
      900: '#0a1828',
    },
    gold: {
      400: '#e5c055',
      500: '#d4a843',
      600: '#b88a2d',
    },
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: '#f5f7fa',
        color: '#1a202c',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(26,58,92,0.12)',
          border: '1px solid #e2ecf5',
        },
      },
    },
  },
});

export function ChakraProviders({ children }: { children: ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}
