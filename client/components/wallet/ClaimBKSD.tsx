import React from 'react';
import { useContractRead } from 'wagmi';
import Loader from '../common/Loader';
import BlockSendRouter from '../../contracts/BlockSendRouter.json'

const ClaimBKSD = () => {
  const { data, isError, isLoading } = useContractRead({
    address: process.env.NEXT_PUBLIC_BLOCKSEND_ROUTER_ADDRESS,
    abi: BlockSendRouter.abi,
    functionName: 'getMyTranferRewardsBalance',
  })
  console.log("🚀 ~ file: ClaimBKSD.tsx:13 ~ ClaimBKSD ~ data", data)

  if (isLoading) return <Loader />
  if (isError) return <div>{"Une erreur s'est produite"}</div>


  return (
    <div>

    </div>
  );
};

export default ClaimBKSD;
