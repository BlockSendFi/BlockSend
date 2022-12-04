import React, { useContext } from 'react';
import { useQuery } from 'react-query';
import getMyContactsQuery from '../../api/get-my-contacts-query.api';
import { AuthContext } from '../../contexts/auth.context';
import IContact from '../../interfaces/contact.interface';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ContactItem from './ContactItem';

const MyContacts = () => {
  const { accessToken } = useContext(AuthContext)
  const { data, isLoading, isError, error } = useQuery("myContacts", () => getMyContactsQuery(accessToken))

  const contacts = data?.data || []
  const addContact = () => null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{"Mes contacts"}</h2>
        <Button title="Ajouter un contact" onClick={addContact} />
      </div>

      {
        isError ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <div className="text-red-500 mt-2">{(error as any).response.data.message}</div>
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
                            <ContactItem key={index} contact={contact} />
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
