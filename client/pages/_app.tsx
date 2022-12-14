import React, { FC } from 'react';
import type { AppProps } from 'next/app'
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import { WagmiConfig, createClient, chain, configureChains } from 'wagmi'
import '../styles/globals.css'
import Head from 'next/head';
import AuthContextProvider from '../contexts/auth.context';
import LayoutContextProvider from '../contexts/layout.context';

import { publicProvider } from 'wagmi/providers/public'

const queryClient = new QueryClient()
const { provider } = configureChains([chain.polygon], [publicProvider()])

const client = createClient({
  autoConnect: true,
  provider,
  // provider: getDefaultProvider(),
})


const App: FC<AppProps> = ({ Component, pageProps }) => {
  return <>
    <Head>
      <title>{"Blocksend : World Crypto Dimension"}</title>
      <meta name="description" content="Send money accross the world" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={client}>
        <AuthContextProvider>
          <LayoutContextProvider>
            <Component {...pageProps} />
          </LayoutContextProvider>
        </AuthContextProvider>
      </WagmiConfig>
    </QueryClientProvider>
  </>
};

export default App;
