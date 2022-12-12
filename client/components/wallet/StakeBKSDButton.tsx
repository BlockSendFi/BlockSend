import React, { FC } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import Button from '../common/Button';
import BlockSendStakingRewards from '../../contracts/BlockSendStakingRewards.json'
import { BigNumber } from 'ethers';

const StakeBKSDButton: FC<{ balance: BigNumber }> = ({ balance }) => {
  console.log("🚀 ~ file: StakeBKSDButton.tsx:26 ~ balance", balance)
  console.log('>>', process.env.NEXT_PUBLIC_BLOCKSEND_STACKING_ADDRESS)
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_STACKING_ADDRESS,
    abi: BlockSendStakingRewards.abi,
    functionName: 'stake',
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
    args: [1, 0],
  })
  console.log("🚀 ~ file: StakeBKSDButton.tsx:17 ~ config", config)

  const { write, error } = useContractWrite(config)
  console.log("🚀 ~ file: StakeBKSDButton.tsx:20 ~ error", error)

  const handleClaim = () => write?.(1, 0)

  return (
    <div className="text-center w-full">
      <Button title={"Stacker mes BKSD 🚀"} onClick={handleClaim} />
    </div>
  );
};

export default StakeBKSDButton;
