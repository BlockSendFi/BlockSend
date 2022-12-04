import React, { FC } from 'react';
import IContact from '../../interfaces/contact.interface';
import Button from '../common/Button';

const ContactItem: FC<{ contact: IContact }> = ({ contact }) => {

  const initTransfer = () => null

  return (
    <div className="flex justify-between items-center rounded-2xl border border-gray-200 p-2">

      <div className="flex gap-2">
        <div className="rounded-full h-12 w-12 text-2xl font-bold text-white bg-blue-main flex items-center justify-center">
          {`${contact.firstName[0]}${contact.lastName[0]}`}
        </div>
        <div>
          <div className="font-semibold">{`${contact.firstName} ${contact.lastName}`}</div>
          <div>{`${contact.phoneNumber}`}</div>
        </div>
      </div>

      <Button title="Nouveau transfert" onClick={initTransfer} color="blue-light" />
    </div>
  );
};

export default ContactItem;
