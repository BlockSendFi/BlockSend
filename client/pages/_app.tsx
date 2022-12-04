import React, { FC } from 'react';
import type { AppProps } from 'next/app'
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import '../styles/globals.css'
import Head from 'next/head';
import AuthContextProvider from '../contexts/auth.context';


const queryClient = new QueryClient()

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return <>
    <Head>
      <title>{"Blocksend : World Crypto Dimension"}</title>
      <meta name="description" content="Send money accross the world" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </AuthContextProvider>
  </>
};

export default App;
