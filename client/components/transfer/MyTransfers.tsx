import React, { useContext } from 'react';
import { useQuery } from 'react-query';
import getMyTransfersQuery from '../../api/get-my-transfers-query.api';
import { AuthContext } from '../../contexts/auth.context';
import ITransfer from '../../interfaces/transfer.interface';
import Loader from '../common/Loader';
import TransferItem from './TransferItem';

const MyTransfers = () => {
  const { accessToken } = useContext(AuthContext)
  const { data, isLoading, isError, error } = useQuery("myTransfers", () => getMyTransfersQuery(accessToken as string))
  const transfers = data?.data || []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{"Mes transferts"}</h2>
        {/* <Button title="Ajouter un contact" onClick={addContact} /> */}
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
