import React from 'react';
import { useAccount, useNetwork } from 'wagmi';
import DetectWallet from '../common/DetectWallet';
import MyContacts from '../contact/MyContacts';
import MyTransfers from '../transfer/MyTransfers';
import Rewards from '../wallet/Rewards';
import WalletBalance from '../wallet/WalletBalance';

const InnerApp = () => {
  const { chain } = useNetwork()
  const chainId = parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string)
  const wrongNetwork = chain?.id !== chainId
  const { isConnected } = useAccount()
  return (
    <div className="flex gap-8 flex-col">
      <DetectWallet />
      {
        isConnected && !wrongNetwork && (<>

          <div className="flex gap-6 w-full">
            <div className="flex-grow flex flex-col gap-4">
              <MyTransfers />
              <MyContacts />
            </div>
            <div className="flex flex-col gap-4 w-[300px]">
              <WalletBalance />

              <Rewards />
            </div>
          </div>

        </>)
      }
    </div>
  );
};

export default InnerApp;
