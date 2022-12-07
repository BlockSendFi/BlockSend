import React, { FC, useContext, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import initTransferMutation from '../../api/init-transfer-mutation.api';
import { AuthContext } from '../../contexts/auth.context';
import IContact from '../../interfaces/contact.interface';
import Button from '../common/Button';
import ChevronDownIcon from '../common/icons/ChevronDownIcon';
import ChevronRightIcon from '../common/icons/ChevronRightIcon';
import Input from '../common/Input';
import { useAccount, useContractWrite } from 'wagmi'
import ERC20Contract from '../../contracts/ERC20.json';
import { utils } from 'ethers';

const ContactItem: FC<{ contact: IContact }> = ({ contact }) => {
  const [open, setOpen] = useState(false)
  const { accessToken } = useContext(AuthContext)
  const client = useQueryClient()
  const { address } = useAccount()

  const approveEUReRequest = useContractWrite({
    mode: "recklesslyUnprepared",
    address: process.env.NEXT_PUBLIC_MONERIUM_EURE_CONTRACT,
    abi: ERC20Contract.abi,
    functionName: 'approve',
  })

  const { formState: { errors }, register, handleSubmit, reset } = useForm()

  const { isLoading, mutate } = useMutation(initTransferMutation, {
    onSuccess: () => {
      reset()
      client.invalidateQueries('myTransfers')
      alert('Votre transfert a bien été initié.')
    }
  })


  const approveEUReForTransfer = async (amount: number) => {
    // TODO: Get pending transfers transfer and compute the total amount
    if (!approveEUReRequest.write) return
    const decimalAmount = utils.parseUnits(amount.toString(), 18)
    await approveEUReRequest.writeAsync?.({
      recklesslySetUnpreparedArgs: [process.env.NEXT_PUBLIC_BLOCKSEND_CONTRACT, decimalAmount],
    })
    mutate({ initTransferInput: { amount, walletAddress: address as string, contact: contact._id }, accessToken: accessToken as string })
  }

  const initTransfer = ({ amount }: FieldValues) => approveEUReForTransfer(amount)

  return (
    <div className="flex flex-col gap-2">

      <div className="flex justify-between items-center rounded-2xl border border-gray-200 p-2 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex gap-2" >
          <div className="rounded-full h-12 w-12 text-2xl font-bold text-white bg-blue-main flex items-center justify-center">
            {`${contact.firstName[0]}${contact.lastName[0]}`}
          </div>
          <div>
            <div className="font-semibold">{`${contact.firstName} ${contact.lastName}`}</div>
            <div>{`${contact.phoneNumber}`}</div>
          </div>
        </div>

        {
          open ? (
            <ChevronDownIcon className="cursor-pointer" />
          ) : (
            <ChevronRightIcon className="cursor-pointer" />
          )
        }
      </div>

      {
        open && (
          <div>
            <h3 className="font-bold text-lg">{"Nouveau transfert"}</h3>

            <form className="mt-2 flex gap-2 items-end" onSubmit={handleSubmit(initTransfer)}>
              <Input
                type="number"
                label="Montant du transfert en €"
                register={register}
                name="amount"
                errors={errors}
                rules={{
                  required: 'Ce champ est obligatoire',
                  valueAsNumber: true,
                }}
                placeholder="Montant de la transaction"
              />
              <Button title="Envoyer" type="submit" loading={isLoading} />
            </form>
          </div>
        )
      }

      {/* <Button title="Nouveau transfert" onClick={initTransfer} color="blue-light" /> */}
    </div>
  );
};

export default ContactItem;
