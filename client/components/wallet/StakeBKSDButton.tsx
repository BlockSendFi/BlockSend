import React, { FC } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import Button from '../common/Button';
import BlockSendStakingRewards from '../../contracts/BlockSendStakingRewards.json'
import { BigNumber } from 'ethers';

const StakeBKSDButton: FC<{ balance: BigNumber }> = ({ balance }) => {
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_STACKING_ADDRESS,
    abi: BlockSendStakingRewards.abi,
    functionName: 'stake',
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
    args: [1, 0],
  })

  const { write } = useContractWrite(config)

  const handleClaim = () => write?.(1, 0)

  return (
    <div className="text-center w-full">
      <Button title={"Stacker mes BKSD 🚀"} onClick={handleClaim} />
    </div>
  );
};

export default StakeBKSDButton;
