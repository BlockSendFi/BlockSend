import React, { FC, useContext } from 'react';
import { Dialog } from '@headlessui/react'
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';
import validationRegex from '../../constants/regex.constant';
import { useMutation, useQueryClient } from 'react-query';
import { LayoutContext } from '../../contexts/layout.context';
import addContactMutation from '../../api/add-contact-mutation.api';
import { AuthContext } from '../../contexts/auth.context';
import IContact from '../../interfaces/contact.interface';

const AddContactModal: FC = () => {
  const { accessToken } = useContext(AuthContext)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { closeModal } = useContext(LayoutContext)
  const client = useQueryClient()

  const { isLoading, mutate } = useMutation(addContactMutation, {
    onSuccess: () => {
      client.invalidateQueries('myContacts')
      closeModal()
    }
  })

  const handleOnSubmit = handleSubmit((values) => {
    mutate({
      addContactInput: values as IContact,
      accessToken: accessToken as string
    })
  })

  return (
    <>
      <Dialog.Title className="text-center text-xl uppercase font-bold">{"Ajouter un contact"}</Dialog.Title>

      <form onSubmit={handleOnSubmit} className="mt-6 justify-center flex flex-col">
        <div className="flex flex-col gap-4 w-full">
          <Input label="Nom" register={register} name="lastName" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Nom" />
          <Input label="Prénom" register={register} name="firstName" errors={errors} rules={{ required: 'Ce champ est obligatoire' }} placeholder="Prénom" />
          <Input label="N° de téléphone" register={register} name="phoneNumber" errors={errors}
            rules={{
              required: 'Ce champ est obligatoire',
              pattern: {
                value: validationRegex.PHONENUMBER_REGEX,
                message: `Le format du numéro de téléphone est invalide`
              }
            }}
            placeholder="Numéro du téléphone" />
        </div>

        <div className="mt-10 flex justify-center">
          <Button type="submit" title="Ajouter un contact" loading={isLoading} />
        </div>
      </form>
    </>
  );
};

export default AddContactModal;
