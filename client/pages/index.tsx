import Head from 'next/head'


import React from 'react';

const IndexPage = () => {
  return (
    <div>
      <Head>
        <title>Blocksend : World Crypto Dimension</title>
        <meta name="description" content="Send money accross the world" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <h1>{"BlockSend"}</h1>
      </div>
    </div>
  );
};

export default IndexPage;

