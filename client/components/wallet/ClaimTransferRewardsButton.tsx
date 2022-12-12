import React from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import Button from '../common/Button';
import BlockSendRouter from '../../contracts/BlockSendRouter.json'

const ClaimBKSDButton = () => {
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_ROUTER_ADDRESS,
    abi: BlockSendRouter.abi,
    functionName: 'claimTransferRewards',
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
  })

  const { write } = useContractWrite(config)

  const handleClaim = () => write?.()

  return (
    <div className="text-center w-full">
      <Button title={"Récupérer maintenant 🔥"} onClick={handleClaim} />
    </div>
  );
};

export default ClaimBKSDButton;
