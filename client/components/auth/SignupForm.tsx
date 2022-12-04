import React, { FC, useContext } from 'react';
import Button from '../common/Button';
import { FieldValues, useForm } from 'react-hook-form';
import Input from '../common/Input';
import {
  useMutation,
} from 'react-query'
import Link from 'next/link';
import validationRegex from '../../constants/regex.constant';
import signupMutation from '../../api/signup-mutation.api';
import ISignupInput from '../../interfaces/signup-input.interface';
import { AuthContext } from '../../contexts/auth.context';

const SignupForm: FC = () => {
  const { login } = useContext(AuthContext)

  const { mutate, error, isError, isLoading } = useMutation(signupMutation, {
    onSuccess: (data) => login(data.data)
  })

  const { handleSubmit, register, formState: { errors } } = useForm()

  const onSubmit = (values: FieldValues) => {
    mutate(values as ISignupInput)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 justify-end">
      <div className="flex flex-col gap-4">
        <Input labelClass="text-white" label="Nom" register={register} name="lastName" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre nom" />
        <Input labelClass="text-white" label="Prénom" register={register} name="firstName" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Votre prénom" />
        <Input labelClass="text-white" label="Email" register={register} name="email" errors={errors}
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

      <Link href="/login" className="text-white  underline text-right underline-offset-2">
        {"Vous avez déja un compte ?"}
      </Link>

      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isError && <div className="text-red-500 mt-2">{(error as any).response.data.message}</div>
      }

      <div className="flex justify-end">
        <Button title="Créer mon compte" className="items-self-end" type="submit" loading={isLoading} />
      </div>
    </form>
  );
};

export default SignupForm;
