import React, { FC } from 'react';
import Hero from './Hero';
import { Inter } from '@next/font/google'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', "600", '700'],
  style: ['normal']
})

const Layout: FC<{ children: JSX.Element, heroContent?: JSX.Element, variant?: boolean }> = ({ children, heroContent, variant = false }) => {
  return (
    <div className={inter.className}>
      <Hero variant={variant}>
        {heroContent}
      </Hero>

      <div>
        {
          children
        }
      </div>
      <ToastContainer />
    </div>
  );
};

export default Layout;
