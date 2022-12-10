import React, { useContext } from 'react';
import { useQuery } from 'react-query';
import getMyTransfersQuery from '../../api/get-my-transfers-query.api';
import { AuthContext } from '../../contexts/auth.context';
import { LayoutContext } from '../../contexts/layout.context';
import { ModalEnum } from '../../enums/modal.enum';
import ITransfer from '../../interfaces/transfer.interface';
import Button from '../common/Button';
import Loader from '../common/Loader';
import TransferItem from './TransferItem';

const MyTransfers = () => {
  const { accessToken } = useContext(AuthContext)
  const { data, isLoading, isError, error } = useQuery("myTransfers", () => getMyTransfersQuery(accessToken as string))
  const transfers = data?.data || []
  const { openModal } = useContext(LayoutContext)

  const handleNewTransfer = () => openModal(ModalEnum.NEW_TRANSFER)

  return (
    <div className="flex flex-col gap-4 flex-grow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{"Mes transferts"}</h2>


        <Button title="Nouveau transfert" onClick={handleNewTransfer} />
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
                    transfers.length ? (
                      <div className="flex flex-col gap-2">
                        {
                          transfers.map((transfer: ITransfer, index: number) => (
                            <TransferItem key={index} transfer={transfer} />
                          ))
                        }
                      </div>
                    ) : (
                      <div className="opacity-60">{"Vous n'avez pas encore de transferts."}</div>
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

export default MyTransfers;
