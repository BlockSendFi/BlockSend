import React, { FC, useContext } from 'react';
import ITransfer from '../../interfaces/transfer.interface';
import dayjs from 'dayjs'
import { ModalEnum } from '../../enums/modal.enum';
import { LayoutContext } from '../../contexts/layout.context';
import { FaCheckCircle, FaChevronRight, FaQuestionCircle, FaTimesCircle } from 'react-icons/fa';
import { TransferStatus } from '../../enums/transfer-status.enum';

const TransferItem: FC<{ transfer: ITransfer }> = ({ transfer }) => {
  const { openModal } = useContext(LayoutContext);

  const openDetails = () => openModal(ModalEnum.TRANSFER_DETAILS, { transferId: transfer._id })

  return (
    <div className="flex flex-col gap-2 px-4 py-3 border border-gray-200 p-2 cursor-pointer rounded-2xl" onClick={openDetails}>
      <div className="flex justify-between items-center " onClick={openDetails}>
        <div className="flex gap-2" >

          <div className="flex justify-center items-center rounded-full h-12 w-12">
            {
              transfer.status === TransferStatus.FAILED || transfer.status === TransferStatus.OFFRAMP_COMPLETED ? (
                <>
                  {
                    transfer.status === TransferStatus.FAILED && (
                      <FaTimesCircle className="text-4xl text-red-400" />
                    )
                  }
                  {
                    transfer.status === TransferStatus.OFFRAMP_COMPLETED && (
                      <FaCheckCircle className="text-4xl text-green-main" />
                    )
                  }
                </>
              ) : (
                <FaQuestionCircle className="text-4xl text-gray-400" />
              )
            }
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

        <FaChevronRight />
      </div>

    </div>
  );
};

export default TransferItem;
