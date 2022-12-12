import React, { FC } from 'react';
import { useContractRead } from 'wagmi';
import Loader from '../common/Loader';
import BlockSendStakingRewards from '../../contracts/BlockSendStakingRewards.json'
import { BigNumber, utils } from 'ethers';
import { FaLock } from 'react-icons/fa';


const StakedBKSD: FC<{ address: `0x${string}` }> = ({ address }) => {
  const { isError, isLoading, data } = useContractRead({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_STACKING_ADDRESS,
    abi: BlockSendStakingRewards.abi,
    functionName: 'userTokensStaked',
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
    args: [address],
    watch: true,
  })

  if (isLoading) return <Loader />
  if (isError) return <div>{"Une erreur s'est produite"}</div>

  if ((data as BigNumber).isZero()) return null

  return (
    <div className="text-2xl gap-2 flex items-center py-2 justify-center">

      <FaLock />
      <div className="text-3xl font-semibold">
        {utils.formatUnits((data as BigNumber).toString(), 18)}
      </div>

      <div className="font-bold text-sm">
        {"BKSD STAKED"}
      </div>
    </div>
  );
};

export default StakedBKSD;
