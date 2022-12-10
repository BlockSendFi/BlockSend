import React, { FC } from 'react';
import IContact from '../../interfaces/contact.interface';
import ChevronRightIcon from '../common/icons/ChevronRightIcon';

import PhoneNumber from '../common/PhoneNumber';

const ContactItem: FC<{ contact: IContact, onClick: () => void }> = ({ contact, onClick }) => {
  // const [open, setOpen] = useState(false)
  // const { accessToken } = useContext(AuthContext)
  // const client = useQueryClient()
  // const { address } = useAccount()

  // const approveEUReRequest = useContractWrite({
  //   mode: "recklesslyUnprepared",
  //   address: process.env.NEXT_PUBLIC_MONERIUM_EURE,
  //   abi: ERC20Contract.abi,
  //   functionName: 'approve',
  // })

  // const { formState: { errors }, register, handleSubmit, reset } = useForm()

  // const { isLoading, mutate } = useMutation(initTransferMutation, {
  //   onSuccess: () => {
  //     reset()
  //     client.invalidateQueries('myTransfers')
  //     alert('Votre transfert a bien été initié.')
  //   }
  // })


  // const approveEUReForTransfer = async (amount: number) => {
  //   // TODO: Get pending transfers transfer and compute the total amount
  //   if (!approveEUReRequest.write) return
  //   const decimalAmount = utils.parseUnits(amount.toString(), 18)
  //   await approveEUReRequest.writeAsync?.({
  //     recklesslySetUnpreparedArgs: [process.env.NEXT_PUBLIC_BLOCKSEND_ROUTER_ADDRESS, decimalAmount],
  //   })
  //   mutate({ initTransferInput: { amount, walletAddress: address as string, contact: contact._id }, accessToken: accessToken as string })
  // }

  // const initTransfer = ({ amount }: FieldValues) => approveEUReForTransfer(amount)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center rounded-2xl border border-gray-200 p-2 cursor-pointer" onClick={onClick}>
        <div className="flex gap-2" >
          <div className="rounded-full h-12 w-12 text-2xl font-bold text-white bg-blue-main flex items-center justify-center">
            {`${contact.firstName[0]}${contact.lastName[0]}`}
          </div>
          <div>
            <div className="font-semibold">{`${contact.firstName} ${contact.lastName}`}</div>
            <div><PhoneNumber phoneNumber={contact.phoneNumber} /></div>
          </div>
        </div>

        <ChevronRightIcon className="cursor-pointer" />

        {/* {
          open ? (
            <ChevronDownIcon className="cursor-pointer" />
          ) : (
            <ChevronRightIcon className="cursor-pointer" />
          )
        } */}
      </div>

      {/* {
        open && (
          <div>
            <h3 className="font-bold text-lg">{"Nouveau transfert"}</h3>

            <form className="mt-2 flex gap-2 items-end" onSubmit={handleSubmit(initTransfer)}>
              <Input
                type="number"
                label="Montant du transfert en €"
                register={register}
                name="amount"
                min={0.5}
                step={0.01}
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
      } */}

      {/* <Button title="Nouveau transfert" onClick={initTransfer} color="blue-light" /> */}
    </div>
  );
};

export default ContactItem;
