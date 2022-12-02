import React, { FC } from 'react';
import Button from '../common/Button';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Input from '../common/Input';
import Link from 'next/link';

const SignupForm: FC = () => {
  const router = useRouter()
  const { handleSubmit, register, formState: { errors } } = useForm()

  const onSubmit = () => {
    router.push('/app')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 justify-end">
      <div className="flex flex-col gap-4">
        <Input label="Nom" register={register} name="lastName" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre nom" />
        <Input label="Prénom" register={register} name="firstName" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre prénom" />
        <Input label="Email" register={register} name="email" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre email" />
        <Input label="Mot de passe" register={register} name="password" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre mot de passe" />
      </div>

      <Link href="/login" className="text-white text-sm underline text-right">
        {"Vous avez déja un compte ?"}
      </Link>

      <div className="flex justify-end">
        <Button title="Se connecter" className="items-self-end" type="submit" />
      </div>
    </form>
  );
};

export default SignupForm;
