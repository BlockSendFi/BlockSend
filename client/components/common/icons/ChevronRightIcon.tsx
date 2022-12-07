import clsx from 'clsx';
import React from 'react';

const ChevronRightIcon = ({ className = "", onClick = () => null }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" onClick={onClick} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={clsx("w-6 h-6", className)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>

  );
};

export default ChevronRightIcon;
