import React from 'react';
import InnerBlock from '../components/layouts/InnerBlock';
import Layout from '../components/layouts/Layout';
import heroBg from '../assets/hero-bg.jpg';

import dynamic from 'next/dynamic';

const InnerApp = dynamic(() => import('../components/layouts/InnerApp'), { ssr: false })

const AppPage = () => {
  // const router = useRouter()
  // const { accessToken } = useContext(AuthContext)

  // useEffect(() => {
  //   if (!accessToken) router.push('/')
  // }, [accessToken, router])

  return (
    <Layout variant>
      <div
        className="py-6 flex-grow"
        style={{
          backgroundImage: `url(${heroBg.src})`,
          backgroundSize: 'cover',
        }}>
        <InnerBlock className="py-8 px-6 bg-white">
          <InnerApp />
        </InnerBlock>
      </div>
    </Layout>
  );
};

export default AppPage;

