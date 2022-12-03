import React from 'react';
import Layout from '../components/layouts/Layout';
import SignupForm from '../components/auth/SignupForm';

const SignupPage = () => {
  return (
    <Layout
      heroContent={
        <div className="flex justify-end">
          <SignupForm />
        </div>
      }>
      <div>
      </div>
    </Layout>
  );
};

export default SignupPage;

