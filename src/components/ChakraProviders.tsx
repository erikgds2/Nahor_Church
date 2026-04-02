'use client';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ReactNode } from 'react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6eef4',
      100: '#b3cee0',
      200: '#80aecc',
      300: '#4d8eb8',
      400: '#2676a9',
      500: '#033D60',
      600: '#02354f',
      700: '#022c41',
      800: '#011e2c',
      900: '#011018',
    },
    gold: {
      400: '#ffd980',
      500: '#FFCC66',
      600: '#e6b34d',
    },
    ccb: {
      gray: '#CDD4DC',
      black: '#201E1E',
      medium: '#A5A5A5',
      teal: '#49656C',
      green: '#5DB196',
      lightGreen: '#98CDBD',
      red: '#DC3C00',
    },
  },
  fonts: {
    heading: 'Verdana, Geneva, sans-serif',
    body: 'Verdana, Geneva, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: '#FFFFFF',
        color: '#201E1E',
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
          boxShadow: '0 8px 24px rgba(3,61,96,0.10)',
          border: '1px solid #CDD4DC',
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
