import React, { FC, useContext } from 'react';
import { Dialog } from '@headlessui/react'
import { useQuery } from 'react-query';
import getTransferQuery from '../../api/get-transfer-query.api';
import { AuthContext } from '../../contexts/auth.context';
import Loader from '../common/Loader';
import TransferResume from './TransferResume';
import ITransfer from '../../interfaces/transfer.interface';
import { FaCheckCircle, FaQuestionCircle, FaTimesCircle } from 'react-icons/fa';
import { TransferStatus } from '../../enums/transfer-status.enum';
import LoadingIcon from '../common/icons/LoadingIcon';

interface Props {
  transferId: string
}

const TransferDetailsModal: FC<Props> = ({ transferId }) => {
  const { accessToken } = useContext(AuthContext)

  const { data, isLoading, isError } = useQuery(
    ["transfer", transferId],
    () => getTransferQuery({ accessToken: accessToken as string, transferId }),
    {
      refetchInterval: 1000,
    })

  if (isLoading) return <Loader />
  if (isError) return <div>{"Une erreur est survenue"}</div>

  const transfer = data?.data as ITransfer
  return (
    <>
      <Dialog.Title className="text-center text-xl uppercase font-bold">{`Détails du transfert`}</Dialog.Title>

      <div className="flex flex-col gap-4 mt-4">
        <TransferResume transfer={transfer} />

        <hr />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="text-sm">{"En attente de virement"}</div>

            {
              transfer.status !== TransferStatus.PENDING ? <FaCheckCircle className="text-green-main" /> : <FaQuestionCircle className="text-gray-400" />
            }
          </div>

          <div className="flex justify-between">
            <div className="text-sm">{"Début routage onchain"}</div>

            {
              transfer.routingOnChainStarted ? <FaCheckCircle className="text-green-main" /> : <FaQuestionCircle className="text-gray-400" />
            }
          </div>

          <div className="flex justify-between">
            <div className="text-sm">{"Routage onchain terminé"}</div>

            {
              transfer.routingOnChainCompleted ? <FaCheckCircle className="text-green-main" /> : <FaQuestionCircle className="text-gray-400" />
            }
          </div>

          <div className="flex justify-between">
            <div className="text-sm">{"Début transfert offchain"}</div>

            {
              transfer.offchainTransferStarted ? <FaCheckCircle className="text-green-main" /> : <FaQuestionCircle className="text-gray-400" />
            }
          </div>

          <div className="flex justify-between">
            <div className="text-sm">{"Réception mobile money"}</div>

            {
              transfer.offchainTransferCompleted ? <FaCheckCircle className="text-green-main" /> : <FaQuestionCircle className="text-gray-400" />
            }
          </div>
        </div>

        <hr />

        <div className="flex gap-2">
          <div>{"Status : "}</div>
          <div>{transfer.status}</div>
        </div>

        <div className="flex justify-center">
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
              <LoadingIcon />
            )
          }
        </div>
      </div>
    </>
  );
};

export default TransferDetailsModal;
