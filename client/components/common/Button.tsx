import clsx from 'clsx';
import React, { FC } from 'react';


const Button: FC<{
  title: string;
  type?: 'button' | 'submit' | 'reset',
  className?: string;
}> = ({ title, type = "button", className = "" }) => {
  return (
    <button className={clsx("h-[48px] text-white bg-green-main px-10 flex items-center font-bold", className)} type={type}>
      {title}
    </button>
  );
};

export default Button;
