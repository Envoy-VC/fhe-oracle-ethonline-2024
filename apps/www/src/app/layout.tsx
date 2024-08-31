import { headers } from 'next/headers';

import { wagmiConfig } from '~/lib/viem';

import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { cookieToInitialState } from 'wagmi';
import { SmoothScrollProvider, Web3Provider } from '~/providers';
import '~/styles/globals.css';
import { TRPCReactProvider } from '~/trpc/react';

import { Toaster } from '~/components/ui/sonner';

export const metadata: Metadata = {
  title: 'FHE Oracle',
  description:
    'A fully homomorphic encryption-powered data oracle on Fhenix blockchain. Compute or fetch any data using Lit Protocol actions',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get('cookie')
  );

  return (
    <html lang='en'>
      <SmoothScrollProvider>
        <body className={`font-sans ${GeistSans.variable}`}>
          <TRPCReactProvider>
            <Web3Provider initialState={initialState}>{children}</Web3Provider>
          </TRPCReactProvider>
          <Toaster />
        </body>
      </SmoothScrollProvider>
    </html>
  );
};

export default RootLayout;
