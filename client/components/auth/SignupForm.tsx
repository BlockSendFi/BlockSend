import React, { FC } from 'react';
import Button from '../common/Button';
import { FieldValues, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Input from '../common/Input';
import {
  useMutation,
  useQueryClient,
} from 'react-query'
import Link from 'next/link';
import validationRegex from '../../constants/regex.constant';
import signupMutation from '../../api/signup-mutation.api';
import ISignupInput from '../../interfaces/signup-input.interface';
import Loader from '../common/Loader';

const SignupForm: FC = () => {
  const router = useRouter()

  const { mutate, isLoading } = useMutation(signupMutation, {
    onSuccess: () => {
      router.push('/app')
    },
  })

  const { handleSubmit, register, formState: { errors } } = useForm()

  const onSubmit = (values: FieldValues) => {
    mutate(values as ISignupInput)
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 justify-end">
      <div className="flex flex-col gap-4">
        <Input label="Nom" register={register} name="lastName" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre nom" />
        <Input label="Prénom" register={register} name="firstName" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre prénom" />
        <Input label="Email" register={register} name="email" errors={errors}
          rules={{
            required: 'Ce champ est obligatoire',
            pattern: {
              value: validationRegex.EMAIL_REGEX,
              message: `Le format de l'email est invalide`
            }
          }}
          placeholder="Votre email" />
        <Input
          type="password"
          label="Mot de passe" register={register} name="password" errors={errors} rules={{
            required: 'Ce champ est obligatoire', pattern: {
              value: validationRegex.PASSWORD_REGEX,
              message: `Votre mot de passe doit faire au minimum 8 caracteres avec au moins 1 lettre minuscule, 1 lettre majuscule et 1 chiffre`
            }
          }} placeholder="Votre mot de passe" />
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
