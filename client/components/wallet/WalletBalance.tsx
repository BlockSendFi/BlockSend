import Link from 'next/link';
import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import Button from '../common/Button';
import Loader from '../common/Loader';
// import BKSDBalance from './BKSDBalance';

const WalletBalance = () => {
  const { address } = useAccount()
  const { data, isError, isLoading } = useBalance({
    address,
    chainId: parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string),
    token: process.env.NEXT_PUBLIC_BKSD_TOKEN as `0x${string}`,
  })

  if (isLoading) return <Loader />
  if (isError) return <div>{"Error fetching balance"}</div>

  const BKSDBalance = data?.value.toNumber() || 0

  return (
    <div className="px-4 py-6 border rounded-2xl  border-gray-200">
      <h2 className="text-xl font-bold text-center">{"Votre wallet"}</h2>

      <hr className="my-2" />
      <div className="mt-2 flex flex-col gap-6 justify-center">
        <div className="flex flex-col gap-2">
          <div className="text-2xl gap-2 flex items-center py-2 justify-center">

            <div className="text-3xl font-semibold">
              {data?.formatted}
            </div>

            <div className="font-bold text-sm">
              {data?.symbol}
            </div>
          </div>


          {
            BKSDBalance > 0 ? (
              <Button title={"Stacker mes BKSD 🚀"} />
            ) : (
              <div className="text-center">
                <Link className="underline text-sm underline-offset-2" target="_blank" href={"https://mumbai.polygonscan.com/address/0x3c7ebddbe30e07472b7de2e9c739cef89ba6e079"}>{"Acheter du BKSD"}</Link>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default WalletBalance;
