import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import { ChakraProviders } from '@/components/ChakraProviders';
import { AppProvider } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const HeroSection = dynamic(() => import('@/components/HeroSection'), { ssr: false });

export const metadata: Metadata = {
  title: 'CCB · Centro de Distribuição',
  description: 'Sistema de Distribuição de Hinários e Bíblias - Congregação Cristã no Brasil',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ChakraProviders>
          <AppProvider>
            <HeroSection />
            <Navigation />
            <main>{children}</main>
            <Footer />
          </AppProvider>
        </ChakraProviders>
      </body>
    </html>
  );
}
