import Head from 'next/head'


import React from 'react';

const IndexPage = () => {
  return (
    <div>
      <Head>
        <title>{"Blocksend : World Crypto Dimension"}</title>
        <meta name="description" content="Send money accross the world" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-3xl font-bold underline">
        {"Hello world!"}
      </h1>
    </div>
  );
};

export default IndexPage;

