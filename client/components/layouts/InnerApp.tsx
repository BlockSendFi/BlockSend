import React from 'react';
import { useAccount, useNetwork } from 'wagmi';
import DetectWallet from '../common/DetectWallet';
import MyContacts from '../contact/MyContacts';
import MyTransfers from '../transfer/MyTransfers';

const InnerApp = () => {
  const { chain } = useNetwork()
  const chainId = parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string)
  const wrongNetwork = chain?.id !== chainId
  const { isConnected } = useAccount()

  return (
    <div>
      <div className="flex gap-6 flex-col">
        <DetectWallet />
        {
          isConnected && !wrongNetwork && (
            <>
              <MyTransfers />
              <MyContacts />
            </>
          )
        }
      </div>
    </div>
  );
};

export default InnerApp;
