import React, { FC } from 'react';
import ITransfer from '../../interfaces/transfer.interface';

const TransferResume: FC<{ transfer: Partial<ITransfer> }> = ({ transfer }) => {
  return (
    <>
      <div>
        <span>
          {"Destinataire : "}
        </span>
        <span>
          {transfer.recipient?.firstName} {transfer.recipient?.lastName}
        </span>
      </div>
      <div>
        <span>
          {"Montant : "}
        </span>
        <span>
          {`${(transfer.amount)?.toFixed(2)} €`}
        </span>
      </div>
    </>
  );
};

export default TransferResume;
