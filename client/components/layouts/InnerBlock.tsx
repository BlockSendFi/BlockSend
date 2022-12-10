import React, { FC } from 'react';
import clsx from 'clsx'

const InnerBlock: FC<{ className?: string, children: JSX.Element }> = ({ className = "", children }) => {
  return (
    <div className={clsx("max-w-5xl m-auto", className)}>
      {children}
    </div>
  );
};

export default InnerBlock;
