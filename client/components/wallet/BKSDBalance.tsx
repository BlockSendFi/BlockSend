import React, { FC } from 'react';
import { useBalance } from 'wagmi';
import Loader from '../common/Loader';

const BKSDBalance: FC<{ address: `0x${string}` }> = ({ address }) => {
  return null
  const { data, isError, isLoading } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_MONERIUM_EURE as `0x${string}`,
    // address: process.env.NEXT_PUBLIC_BKSD_TOKEN as `0x${string}`,
  })

  if (isLoading) return <Loader />
  if (isError) return <div>{"Error fetching balance"}</div>

  return (
    <div className="text-2xl gap-2 flex items-center py-2 justify-center">

      <div className="text-3xl font-semibold">
        {data?.formatted}
      </div>

      <div className="font-bold text-sm">
        {/* {"BKSD"} */}
        {data?.symbol}
      </div>
    </div>
  );
};

export default BKSDBalance;
