import React from 'react';
import { useAccount } from 'wagmi';
// import ClaimStackingRewards from './ClaimStackingRewards';
import ClaimTransferRewards from './ClaimTransferRewards';

const Rewards = () => {

  const { address } = useAccount()

  if (!address) return null

  return (
    <div className="px-4 py-6 border rounded-2xl  border-gray-200">
      <h2 className="text-xl font-bold text-center">{"Mes récompenses"}</h2>

      <hr className="my-2" />

      <div className="flex flex-col gap-4">
        <ClaimTransferRewards address={address} />
        {/* <ClaimStackingRewards /> */}
      </div>
    </div>
  );
};

export default Rewards;
