import React, { FC } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { FieldValues, useForm } from 'react-hook-form';

const COMMON_AMOUNTS = [50, 80, 100, 150, 200]

const TransferAmount: FC<{ onValid: (amount: number) => void }> = ({ onValid }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = ({ amount }: FieldValues) => onValid(amount)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {COMMON_AMOUNTS.map((amount, index) => <div key={index} onClick={() => onValid(amount)} className="bg-blue-light text-white rounded-2xl p-2 cursor-pointer">{`${amount} €`}</div>)}
      </div>

      <hr />
      <form onSubmit={handleSubmit(onSubmit)} className="justify-center flex flex-col">
        <div className="flex gap-2 items-end">
          <Input

            type="number"
            register={register}
            name="amount"
            min={0.5}
            step={0.01}
            errors={errors}
            rules={{
              required: 'Ce champ est obligatoire',
              valueAsNumber: true,
            }}
            placeholder="Montant en € de la transaction"
          />
          <Button title="Continuer" type="submit" />
        </div>
      </form>
    </div >
  );
};

export default TransferAmount;
