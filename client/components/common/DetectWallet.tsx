import React from 'react';
import { useAccount, useConnect, useNetwork } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useSwitchNetwork } from 'wagmi'
import Button from './Button';

const DetectWallet = () => {
  const { chain } = useNetwork()
  const chainId = parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string)
  const wrongNetwork = chain?.id !== chainId
  const { switchNetwork } = useSwitchNetwork()

  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  return (
    <div>
      {isConnected ? (<div className="p-4 bg-blue-main text-white rounded-2xl shadow">
        <div>
          {`Vous êtes connecté avec l'adresse ${address}`}
        </div>

        <div className="mt-2">
          <span>
            {`Cette adresse n'est pas enregistré sur BlockSend. Pour pouvoir faire un nouveau transfert, veuillez `}
          </span>

          <span className="font-semibold underline underline-offset-2 cursor-pointer">
            {"l'enregistrer."}
          </span>
        </div>

        <div className="mt-2">{wrongNetwork && <div>
          <p>{`Vous êtes sur le mauvais réseau ! Veuillez sélectionner le réseau ${process.env.NEXT_PUBLIC_NETWORK_CHAIN_NAME}`}</p>

          <Button
            title="Changer de réseau"
            onClick={() => switchNetwork?.(chainId)}
          />
        </div>}
        </div>
      </div>) : (
        <Button onClick={() => connect()} title="Connecter mon wallet" />
      )}
    </div>
  );
};

export default DetectWallet;
