import React, { FC } from 'react';
import Hero from './Hero';
import { Inter } from '@next/font/google'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

const Crisp = dynamic(() => import('./Crisp'), { ssr: false })

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', "600", '700'],
  style: ['normal']
})

const Layout: FC<{ children: JSX.Element, heroContent?: JSX.Element, variant?: boolean }> = ({ children, heroContent, variant = false }) => {
  return (
    <div className={clsx(inter.className, "h-screen flex flex-col")}>
      <Hero variant={variant}>
        {heroContent}
      </Hero>

      <div className="bg-gray-100 flex flex-grow">
        {
          children
        }
      </div>
      <Crisp />
      <ToastContainer />
    </div>
  );
};

export default Layout;
