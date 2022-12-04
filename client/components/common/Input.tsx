/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';
import { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import clsx from 'clsx'

const Input: FC<{
  label: string;
  name: string;
  type?: string;
  labelClass?: string;
  register: UseFormRegister<FieldValues>;
  errors: Partial<FieldErrorsImpl<{ [x: string]: any; }>>;
  rules?: any;
  placeholder?: string;
}> = ({ label, register, name, errors, rules = {}, placeholder, type = "text", labelClass = "" }) => {
  return (
    <div className="flex flex-col gap-1 w-[300px]">
      {label && <label className={clsx("font-semibold text-sm", labelClass)}>{label}</label>}
      <input className="h-[48px] px-4 outline-none border border-gray-100 rounded-xs" {...register(name, rules)} placeholder={placeholder} type={type} />
      <ErrorMessage errors={errors} name={name} render={({ message }) => <div className="text-red-500 text-sm">{message}</div>} />
    </div>
  );
};

export default Input;
