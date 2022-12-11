import React, { FC } from 'react';
import IContact from '../../interfaces/contact.interface';
import ChevronRightIcon from '../common/icons/ChevronRightIcon';

import PhoneNumber from '../common/PhoneNumber';

const ContactItem: FC<{ contact: IContact, onClick: () => void }> = ({ contact, onClick }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center rounded-2xl border border-gray-200 p-2" onClick={onClick}>
        <div className="flex gap-2" >
          <div className="rounded-full h-12 w-12 text-2xl font-bold text-white bg-blue-main flex items-center justify-center">
            {`${contact.firstName[0]}${contact.lastName[0]}`}
          </div>
          <div>
            <div className="font-semibold">{`${contact.firstName} ${contact.lastName}`}</div>
            <div><PhoneNumber phoneNumber={contact.phoneNumber} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactItem;
