import React, { FC, useContext } from 'react';
import { useQuery } from 'react-query';
import { AuthContext } from '../../contexts/auth.context';
import getMyContactsQuery from '../../api/get-my-contacts-query.api';
import Loader from '../common/Loader';
import ContactItem from '../contact/ContactItem';
import IContact from '../../interfaces/contact.interface';
import IRecipient from '../../interfaces/recipient.interface';
import Button from '../common/Button';
import { LayoutContext } from '../../contexts/layout.context';
import { ModalEnum } from '../../enums/modal.enum';

const TransferRecipient: FC<{ onValid: (recipient: IRecipient) => void }> = ({ onValid }) => {
  const { accessToken } = useContext(AuthContext)
  const { openModal } = useContext(LayoutContext)
  const { data, isLoading, isError } = useQuery("myContacts", () => getMyContactsQuery(accessToken as string))
  const contacts = data?.data || [] as IContact[]

  const onAddContact = () => {
    openModal(ModalEnum.ADD_CONTACT)
  }

  if (isLoading) return <Loader />
  if (isError) return <div>{"Une erreur s'est produite"}</div>

  return (
    <div>
      {
        contacts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {
              contacts.map((contact: IContact, index: number) => <ContactItem key={index} contact={contact} onClick={() => onValid({ firstName: contact.firstName, lastName: contact.lastName, phoneNumber: contact.phoneNumber })} />)
            }
          </div>
        ) :
          <div className="flex flex-col gap-4 justify-center">
            <div className="text-gray-400 self-center">

              {"Vous n'avez pas encore de contact 🙁"}</div>
            <Button title={"Ajouter un contact"} onClick={onAddContact} className="self-center" />
          </div>
      }
    </div >
  );
};

export default TransferRecipient;
