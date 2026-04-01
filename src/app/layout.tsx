import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { ChakraProviders } from '@/components/ChakraProviders';
import { AppProvider } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const HeroSection = dynamic(() => import('@/components/HeroSection'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
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
