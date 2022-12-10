import React, { useContext } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import { useQuery } from 'react-query';
import getMyContactsQuery from '../../api/get-my-contacts-query.api';
import { AuthContext } from '../../contexts/auth.context';
import { LayoutContext } from '../../contexts/layout.context';
import { ModalEnum } from '../../enums/modal.enum';
import IContact from '../../interfaces/contact.interface';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ContactItem from './ContactItem';

const MyContacts = () => {
  const { accessToken } = useContext(AuthContext)
  const { openModal } = useContext(LayoutContext)
  const { data, isLoading, isError, error } = useQuery("myContacts", () => getMyContactsQuery(accessToken as string))
  const contacts = data?.data || []
  const addContact = () => openModal(ModalEnum.ADD_CONTACT)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{"Mes contacts"}</h2>
        <Button onClick={addContact} className="flex items-center gap-2">
          <>
            <FaPlusCircle />
            <span>
              {"Ajouter un contact"}
            </span>
          </>
        </Button>
      </div>

      {
        isError ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <div className="text-red-500 mt-2">{(error as any).response?.data?.message || "Une erreur s'est produite"}</div>
        ) : (
          <>
            {
              isLoading ? (
                <Loader />
              ) : (
                <div>
                  {
                    contacts.length ? (
                      <div className="flex flex-col gap-2">
                        {
                          contacts.map((contact: IContact, index: number) => (
                            <ContactItem key={index} contact={contact} onClick={() => null} />
                          ))
                        }
                      </div>
                    ) : (
                      <div className="opacity-60">{"Vous n'avez pas encore de contact."}</div>
                    )
                  }
                </div>
              )
            }
          </>
        )
      }

    </div>
  );
};

export default MyContacts;
