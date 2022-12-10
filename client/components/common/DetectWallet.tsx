import React from 'react';
import { useAccount, useConnect, useNetwork } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useSwitchNetwork } from 'wagmi'
import Button from './Button';

const DetectWallet = () => {
  const { chain } = useNetwork()
  const chainId = parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID as string)
  const wrongNetwork = chain?.id !== chainId
  const { address, isConnected } = useAccount()
  const { switchNetwork } = useSwitchNetwork()

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  return (
    <div>
      {isConnected ? (<div className="py-6 px-4 bg-blue-main text-white rounded-2xl shadow">
        <div className="text-center">
          {`Vous êtes connecté avec l'adresse `}

          <span className="font-semibold underline underline-offset-2">
            {`${address}`}
          </span>
        </div>

        {
          wrongNetwork && (
            <div className="mt-2">
              <div>
                <p className="text-center">{`Vous êtes sur le mauvais réseau ! Veuillez sélectionner le réseau ${process.env.NEXT_PUBLIC_NETWORK_CHAIN_NAME}`}</p>

                <div className="flex justify-center mt-2">
                  <Button
                    title="Changer de réseau"
                    onClick={() => switchNetwork?.(chainId)}
                  />
                </div>
              </div>
            </div>
          )
        }
      </div>) : (
        <Button onClick={() => connect()} title="Connecter mon wallet" />
      )}
    </div>
  );
};

export default DetectWallet;
