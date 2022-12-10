import React from 'react';
import { useBalance } from 'wagmi';
import Button from '../common/Button';
import Loader from '../common/Loader';

const WalletBalance = () => {
  const { data, isError, isLoading } = useBalance({
    address: process.env.NEXT_PUBLIC_BKSD_TOKEN as `0x${string}`,
  })

  if (isLoading) return <Loader />
  if (isError) return <div>{"Error fetching balance"}</div>

  return (
    <div className="px-4 py-6 border rounded-2xl  border-gray-200 w-[260px] self-start">
      <h2 className="text-xl font-bold text-center">{"Votre wallet"}</h2>

      <hr className="my-2" />
      <div className="mt-2 flex flex-col gap-6 justify-center">
        <div className="flex flex-col gap-2">
          <div className="text-2xl gap-2 flex items-center py-2 justify-center">

            <div className="text-3xl font-semibold">
              {"10200"}
              {data?.formatted}
            </div>

            <div className="font-bold text-sm">
              {"BKSD"}
              {data?.symbol}
            </div>
          </div>

          <Button title="Acheter du BKSD" color="blue-light" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl gap-2 flex items-center py-2 justify-center">

            <div className="text-3xl font-semibold">
              {"0"}
            </div>

            <div className="font-bold text-sm">
              {"USDC"}
            </div>
          </div>
          <div className="text-center">
            {"Reçus en récompense"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletBalance;
