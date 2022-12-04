import React, { FC, useContext } from 'react';
import Button from '../common/Button';
import { FieldValues, useForm } from 'react-hook-form';
import Input from '../common/Input';
import Link from 'next/link';
import { useMutation } from 'react-query'
import validationRegex from '../../constants/regex.constant';
import loginMutation from '../../api/login-mutation.api';
import { AuthContext } from '../../contexts/auth.context';
import ILoginInput from '../../interfaces/login-input.interface';

const LoginForm: FC = () => {
  const { handleSubmit, register, formState: { errors } } = useForm()

  const { login } = useContext(AuthContext)

  const { mutate, isError, isLoading } = useMutation(loginMutation, {
    onSuccess: (data) => login(data.data)
  })

  const onSubmit = (values: FieldValues) => {
    mutate(values as ILoginInput)
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

      <Link href="/signup" className="text-white underline text-right underline-offset-2">
        {"Pas encore de compte ?"}
      </Link>

      {
        isError && <div className="text-red-500 mt-2">{"Email ou mot de passe invalide"}</div>
      }

      <div className="flex justify-end">
        <Button title="Se connecter" className="items-self-end" type="submit" loading={isLoading} />
      </div>
    </form>
  );
};

export default LoginForm;
