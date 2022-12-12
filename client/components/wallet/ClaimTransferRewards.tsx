import { BigNumber, utils } from 'ethers';
import BlockSendRouter from '../../contracts/BlockSendRouter.json'
import React, { FC } from 'react';
import { useContractRead } from 'wagmi';
import Loader from '../common/Loader';
import ClaimTransferRewardsButton from './ClaimTransferRewardsButton';

const ClaimTransferRewards: FC<{ address: `0x${string}` }> = ({ address }) => {
  const { isError, isLoading, data } = useContractRead({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_ROUTER_ADDRESS,
    abi: BlockSendRouter.abi,
    functionName: 'transferRewardsBalance',
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
    args: [address],
    watch: true,
  })

  if (isLoading) return <Loader />
  if (isError) return <div>{"Une erreur s'est produite"}</div>

  return (
    <div className="mt-2 flex flex-col gap-6 justify-center">
      <div className="flex flex-col gap-2">
        <div className="text-2xl gap-2 flex items-center py-2 justify-center">

          <div className="text-3xl font-semibold">
            {utils.formatUnits((data as BigNumber).toString(), 18)}
          </div>

          <div className="font-bold text-sm">
            {"BKSD"}
          </div>
        </div>
        {
          !(data as BigNumber).isZero() && (
            <ClaimTransferRewardsButton />
          )
        }
      </div>
    </div>
  );
};

export default ClaimTransferRewards;
