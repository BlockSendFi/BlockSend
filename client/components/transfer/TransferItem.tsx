import React, { FC, useState } from 'react';
import ITransfer from '../../interfaces/transfer.interface';
import Button from '../common/Button';

const TransferItem: FC<{ transfer: ITransfer }> = ({ transfer }) => {
  const [open, setOpen] = useState(false)


  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center rounded-2xl border border-gray-200 p-2 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex gap-2" >
          <div className="rounded-full h-12 w-12 text-2xl font-bold text-white bg-blue-main flex items-center justify-center">
            {`${transfer.recipient.firstName[0]}${transfer.recipient.lastName[0]}`}
          </div>
          <div>
            <div className="font-semibold">{`${transfer.recipient.firstName} ${transfer.recipient.lastName} (${transfer.recipient.phoneNumber})`}</div>
            <div>{`${transfer.amount} €`}</div>
          </div>
        </div>

        {/* {
          open ? (
            <ChevronDownIcon className="cursor-pointer" />
          ) : (
            <ChevronRightIcon className="cursor-pointer" />
          )
        } */}
        <Button title="Nouveau transfert" onClick={showDetails} color="transparent" />
      </div>

    </div>
  );
};

export default TransferItem;
