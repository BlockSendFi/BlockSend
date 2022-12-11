import React, { FC, useContext } from 'react';
import { Dialog } from '@headlessui/react'
import { useQuery } from 'react-query';
import getTransferQuery from '../../api/get-transfer-query.api';
import { AuthContext } from '../../contexts/auth.context';
import Loader from '../common/Loader';
import TransferResume from './TransferResume';
import ITransfer from '../../interfaces/transfer.interface';

interface Props {
  transferId: string
}

const TransferDetailsModal: FC<Props> = ({ transferId }) => {
  const { accessToken } = useContext(AuthContext)

  const { data, isLoading, isError } = useQuery(
    ["transfer", transferId],
    () => getTransferQuery({ accessToken: accessToken as string, transferId }),
    {
      refetchInterval: 1500,
    })

  if (isLoading) return <Loader />
  if (isError) return <div>{"Une erreur est survenue"}</div>

  const transfer = data?.data as ITransfer
  return (
    <>
      <Dialog.Title className="text-center text-xl uppercase font-bold">{`Détails du transfert`}</Dialog.Title>

      <div className="flex flex-col gap-4 mt-4">
        <TransferResume transfer={transfer} />

        <div>
          <div>{"Status : "}</div>
          <div>{transfer.status}</div>
        </div>
      </div>
    </>
  );
};

export default TransferDetailsModal;
