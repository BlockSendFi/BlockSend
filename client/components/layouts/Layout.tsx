import React, { FC } from 'react';
import Hero from './Hero';
import { Inter } from '@next/font/google'

const inter = Inter({ subsets: ['latin'], weight: '400' })

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
    </div>
  );
};

export default Layout;
