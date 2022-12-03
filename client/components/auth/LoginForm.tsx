import React, { FC } from 'react';
import Button from '../common/Button';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Input from '../common/Input';
import Link from 'next/link';
import validationRegex from '../../constants/regex.constant';

const LoginForm: FC = () => {
  const router = useRouter()
  const { handleSubmit, register, formState: { errors } } = useForm()

  const onSubmit = () => {
    router.push('/app')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 justify-end">
      <div className="flex flex-col gap-4">
        <Input label="Email" register={register} name="email" errors={errors} rules={{
          required: 'Ce champ est obligatoire', pattern: {
            value: validationRegex.EMAIL_REGEX,
            message: `Le format de l'email est invalide`
          }
        }} placeholder="Votre email" />
        <Input
          type="password"
          label="Mot de passe" register={register} name="password" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre mot de passe" />
      </div>

      <Link href="/signup" className="text-white text-sm underline text-right">
        {"Pas encore de compte ?"}
      </Link>

      <div className="flex justify-end">
        <Button title="Se connecter" className="items-self-end" type="submit" />
      </div>
    </form>
  );
};

export default LoginForm;
