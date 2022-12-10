import clsx from 'clsx';
import React, { FC } from 'react';
import LoadingIcon from './icons/LoadingIcon';

const Button: FC<{
  title: string;
  type?: 'button' | 'submit' | 'reset',
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  color?: string;
  textColor?: string;
}> = ({ title, type = "button", className = "", loading = false, onClick, color = 'green-main', textColor = 'white' }) => {

  const buttonProps = {
    disabled: loading,
    className: clsx(`h-[48px] text-${textColor} bg-${color} px-8 items-center flex gap-2 font-bold justify-center`, { "opacity-60": loading }, className),
    type,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  if (onClick) {
    buttonProps.onClick = onClick;
  }
  return (
    <button {...buttonProps}>
      {
        loading && (<LoadingIcon />)
      }
      {title}
    </button>
  );
};

export default Button;
