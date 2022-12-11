import React, { FC } from 'react';
import heroBg from '../../assets/hero-bg.jpg';
import Navbar from './Navbar';
import clsx from 'clsx'
import InnerBlock from './InnerBlock';

const Hero: FC<{ children?: JSX.Element, variant?: boolean }> = ({ children, variant = false }) => {
  return (
    <div
      className={clsx({ "min-h-[640px]": !variant, "minh-[80px]": variant })}
      style={variant ? {} : {
        backgroundImage: `url(${heroBg.src})`,
        backgroundSize: 'cover',
      }}>

      <Navbar variant={variant} />

      {
        !!children && (
          <InnerBlock className="py-[92px]">
            {children}
          </InnerBlock>
        )
      }
    </div>
  );
};

export default Hero;
