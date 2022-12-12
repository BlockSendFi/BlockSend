import React, { FC } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import Button from '../common/Button';
import BlockSendStakingRewards from '../../contracts/BlockSendStakingRewards.json'
import BlockSendToken from '../../contracts/BlockSendToken.json'
import { BigNumber } from 'ethers';
import { toast } from 'react-toastify';

const StakeBKSDButton: FC<{ balance: BigNumber }> = ({ balance }) => {
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_STACKING_ADDRESS,
    abi: BlockSendStakingRewards.abi,
    functionName: 'stake',
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
    args: [balance, 0],
  })

  const approveBKSDRequest = useContractWrite({
    mode: "recklesslyUnprepared",
    address: process.env.NEXT_PUBLIC_BKSD_TOKEN,
    abi: BlockSendToken.abi,
    functionName: 'approve',
  })

  const { write } = useContractWrite(config)

  const handleClaim = async () => {
    try {
      await approveBKSDRequest.writeAsync?.({
        recklesslySetUnpreparedArgs: [process.env.NEXT_PUBLIC_BLOCKSEND_STACKING_ADDRESS, balance],
      })
    } catch (error) {
      return toast.warn(`Vous devez permettre à BlockSend d'utiliser vos tokens BKSD`)
    }
    write?.()
  }

  return (
    <div className="text-center w-full">
      <Button title={"Stacker mes BKSD 🚀"} onClick={handleClaim} className="w-full" />
    </div>
  );
};

export default StakeBKSDButton;
