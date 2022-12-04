import clsx from 'clsx';
import React, { FC } from 'react';
import LoadingIcon from './icons/LoadingIcon';


const Button: FC<{
  title: string;
  type?: 'button' | 'submit' | 'reset',
  className?: string;
  loading?: boolean;
}> = ({ title, type = "button", className = "", loading = false }) => {
  return (
    <button
      disabled={loading}
      className={clsx("h-[48px] text-white bg-green-main px-10 items-center font-bold flex gap-2", { "opacity-60": loading }, className)}
      type={type}
    >
      {
        loading && (<LoadingIcon />)
      }
      {title}
    </button>
  );
};

export default Button;
