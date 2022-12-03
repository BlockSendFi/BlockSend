import React from 'react';
import Layout from '../components/layouts/Layout';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
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

