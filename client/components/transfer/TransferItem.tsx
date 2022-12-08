import React, { FC, useState } from 'react';
import ITransfer from '../../interfaces/transfer.interface';
import Button from '../common/Button';
import dayjs from 'dayjs'

const TransferItem: FC<{ transfer: ITransfer }> = ({ transfer }) => {
  const [open, setOpen] = useState(false)

  const showDetails = () => null


  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center rounded-2xl border border-gray-200 p-2 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex gap-2" >
          <div className="rounded-full h-12 w-12 text-2xl font-bold text-white bg-blue-main flex items-center justify-center">
            {`${transfer.recipient.firstName[0]}${transfer.recipient.lastName[0]}`}
          </div>
          <div>
            <div className="font-semibold">{`${transfer.recipient.firstName} ${transfer.recipient.lastName} (${transfer.recipient.phoneNumber})`}</div>
            <div>
              <span>
                {`${transfer.amount.toFixed(2) || 0} €`}
              </span>

              <span>{" - "}</span>

              <span className="opacity-60">{`Créé le ${dayjs(transfer.createdAt).format("DD/MM/YYYY HH:mm")}`}</span>
            </div>
          </div>
        </div>

        <Button title="Détails" onClick={showDetails} color="transparent" textColor="black" />
      </div>

    </div>
  );
};

export default TransferItem;
