import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import InnerBlock from '../components/layouts/InnerBlock';
import Layout from '../components/layouts/Layout';
import { AuthContext } from '../contexts/auth.context';

import dynamic from 'next/dynamic';

const DetectWallet = dynamic(() => import('../components/common/DetectWallet'), { ssr: false })


const AppPage = () => {
  const router = useRouter()
  const { accessToken } = useContext(AuthContext)

  useEffect(() => {
    if (!accessToken) router.push('/')
  }, [accessToken, router])

  return (
    <Layout variant>
      <InnerBlock className="py-8">
        <DetectWallet />
      </InnerBlock>
    </Layout>
  );
};

export default AppPage;

