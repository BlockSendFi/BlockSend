import React from 'react';
import Script from 'next/script';
import crispScript from '../../scripts/crisp';

const Crisp = () => {
  return (
    <Script src={crispScript} />
  );
};

export default Crisp;
