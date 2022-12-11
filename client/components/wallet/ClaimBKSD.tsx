/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useContractRead } from 'wagmi';
import Loader from '../common/Loader';
import BlockSendRouter from '../../contracts/BlockSendRouter.json'
import { BigNumber } from 'ethers';
import Button from '../common/Button';

const ClaimBKSD = () => {
  const { isError, isLoading, data } = useContractRead({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_ROUTER_ADDRESS,
    abi: BlockSendRouter.abi,
    functionName: 'getMyTranferRewardsBalance',
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
  })

  if (isLoading) return <Loader />
  if (isError) return <div>{"Une erreur s'est produite"}</div>


  return (

    <div className="px-4 py-6 border rounded-2xl  border-gray-200">
      <h2 className="text-xl font-bold text-center">{"Mes récompenses"}</h2>

      <hr className="my-2" />

      <div className="flex flex-col gap-4">

        <div className="mt-2 flex flex-col gap-6 justify-center">
          <div className="flex flex-col gap-2">
            <div className="text-2xl gap-2 flex items-center py-2 justify-center">

              <div className="text-3xl font-semibold">
                {(data as BigNumber).toNumber()}
              </div>

              <div className="font-bold text-sm">
                {"BKSD"}
              </div>
            </div>
            <div className="text-center">
              <Button title={"Récupérer maintenant 🔥"} />
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-6 justify-center">
          <div className="flex flex-col gap-2">
            <div className="text-2xl gap-2 flex items-center py-2 justify-center">

              <div className="text-3xl font-semibold">
                {(data as BigNumber).toNumber()}
              </div>

              <div className="font-bold text-sm">
                {"USDC"}
              </div>
            </div>
            <div className="text-center">
              <Button title={"Récupérer maintenant 🤩"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimBKSD;
