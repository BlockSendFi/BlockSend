import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import InnerBlock from '../components/layouts/InnerBlock';
import Layout from '../components/layouts/Layout';
import { AuthContext } from '../contexts/auth.context';

const AppPage = () => {
  const router = useRouter()
  const { accessToken } = useContext(AuthContext)

  useEffect(() => {
    if (!accessToken) router.push('/login')
  }, [accessToken, router])

  return (
    <Layout variant>
      <InnerBlock>
        <div>
          <h1 className="font-semibold">{"Vous êtes connecté"}</h1>
        </div>
      </InnerBlock>
    </Layout>
  );
};

export default AppPage;

