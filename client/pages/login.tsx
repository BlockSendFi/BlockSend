import React, { useContext, useEffect } from 'react';
import Layout from '../components/layouts/Layout';
import LoginForm from '../components/auth/LoginForm';
import { useRouter } from 'next/router';
import { AuthContext } from '../contexts/auth.context';

const LoginPage = () => {
  const router = useRouter()
  const { accessToken } = useContext(AuthContext)

  useEffect(() => {
    if (!!accessToken) {
      router.push('/app')
    }
  }, [router, accessToken])


  return (
    <Layout
      heroContent={
        <div className="flex justify-end">
          <LoginForm />
        </div>
      }>
      <div>
      </div>
    </Layout>
  );
};

export default LoginPage;

