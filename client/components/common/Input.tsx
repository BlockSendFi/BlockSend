/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';
import { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

const Input: FC<{
  label: string;
  name: string;
  register: UseFormRegister<FieldValues>;
  errors: Partial<FieldErrorsImpl<{ [x: string]: any; }>>;
  rules?: any;
  placeholder?: string;
}> = ({ label, register, name, errors, rules = {}, placeholder }) => {
  return (
    <div className="flex flex-col gap-1 w-[300px]">
      {label && <label className="text-white font-semibold text-sm">{label}</label>}
      <input className="h-[48px] px-4" {...register(name, rules)} placeholder={placeholder} />
      <ErrorMessage errors={errors} name={name} render={({ message }) => <div className="text-red-500 text-sm">{message}</div>} />
    </div>
  );
};

export default Input;
