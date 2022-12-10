
import React, { FC, useContext, useState } from 'react';
import ERC20 from '../../contracts/ERC20.json';
import ITransfer from '../../interfaces/transfer.interface';
import Button from '../common/Button';
import { useAccount, useContractWrite } from 'wagmi';
import { utils } from 'ethers';
import initTransferMutation from '../../api/init-transfer-mutation.api';
import { AuthContext } from '../../contexts/auth.context';
import { LayoutContext } from '../../contexts/layout.context';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import IRecipient from '../../interfaces/recipient.interface';

const TransferConfirmation: FC<{ transfer: Partial<ITransfer> }> = ({ transfer }) => {
  const [approveEUReLoading, setApproveEUReLoading] = useState(false)
  const { address } = useAccount()
  const { accessToken } = useContext(AuthContext)
  const { closeModal } = useContext(LayoutContext)
  // const client = useQueryClient()
  const { isLoading, mutate } = useMutation(initTransferMutation, {
    onSuccess: () => {
      // client.invalidateQueries('myTransfers')
      toast.success('Votre transfert a bien été initié.')
      closeModal()
    }
  })

  const approveEUReRequest = useContractWrite({
    mode: "recklesslyUnprepared",
    address: process.env.NEXT_PUBLIC_MONERIUM_EURE,
    abi: ERC20.abi,
    functionName: 'approve',
  })

  const approveEUReForTransfer = async () => {
    // TODO: Get pending transfers transfer and compute the total amount

    setApproveEUReLoading(true)
    // if (!approveEUReRequest.write) {
    //   setApproveEUReLoading(false)
    //   return toast.warn(`Vous devez permettre à BlockSend d'utiliser vos tokens EURe`)
    // }
    const decimalAmount = utils.parseUnits((transfer.amount as number).toString(), 18)

    try {
      await approveEUReRequest.writeAsync?.({
        recklesslySetUnpreparedArgs: [process.env.NEXT_PUBLIC_BLOCKSEND_ROUTER_ADDRESS, decimalAmount],
      })
    } catch (error) {
      setApproveEUReLoading(false)
      return toast.warn(`Vous devez permettre à BlockSend d'utiliser vos tokens EURe`)
    }
    setApproveEUReLoading(false)
    mutate({
      initTransferInput: {
        amount: transfer.amount as number,
        walletAddress: address as string,
        recipient: transfer.recipient as IRecipient
      },
      accessToken: accessToken as string
    })
  }

  return (
    <div>
      <div>
        <span>
          {"Destinataire : "}
        </span>
        <span>
          {transfer.recipient?.firstName} {transfer.recipient?.lastName}
        </span>
      </div>
      <div>
        <span>
          {"Montant : "}
        </span>
        <span>
          {`${transfer.amount} €`}
        </span>
      </div>

      <div className="mt-4">
        <Button title={"Confirmer le transfert"} onClick={approveEUReForTransfer} loading={isLoading || approveEUReLoading} />
      </div>
    </div>
  );
};

export default TransferConfirmation;
