import React, { FC, useContext, useState } from 'react';
import { Dialog } from '@headlessui/react'
import TransferRecipient from './TransferRecipient';
import ITransfer from '../../interfaces/transfer.interface';
import TransferAmount from './TransferAmount';
import TransferConfirmation from './TransferConfirmation';


const NewTransferModal: FC = () => {
  const [transfer, setTransfer] = useState<Partial<ITransfer>>({})
  const [step, setStep] = useState(0)



  const NEW_TRANSFER_STEPS = [
    {
      title: 'Destinataire du transfert',
      description: 'Choississez le destinataire du transfert',
      component: TransferRecipient,
      componentProps: {
        onValid: (recipient: { firstName: string, lastName: string, phoneNumber: string }) => {
          setTransfer({ ...transfer, recipient })
          setStep(1)
        }
      }
    },
    {
      title: 'Montant du transfert',
      description: 'Choississez un montant ou saississez le manuellement',
      component: TransferAmount,
      componentProps: {
        onValid: (amount: number) => {
          setTransfer({ ...transfer, amount })
          setStep(2)
        }
      }
    },
    {
      title: `Vous êtes sur le point d'effectuer un nouveau transfert`,
      description: 'Veuillez vérifier les informations du transfert',
      component: TransferConfirmation,
      componentProps: {
        transfer
      }
    }
  ]

  const currentStep = NEW_TRANSFER_STEPS[step]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ComponentToRender = currentStep.component as FC<any>

  return (
    <>
      <Dialog.Title className="text-center text-xl uppercase font-bold">{`Nouveau transfert (${step + 1} / ${NEW_TRANSFER_STEPS.length})`}</Dialog.Title>

      <div className="flex flex-col gap-4 mt-4">
        <div>
          <div className="font-semibold">{currentStep.title}</div>
          <div className="opacity-60">{currentStep.description}</div>
        </div>
        <ComponentToRender {...currentStep.componentProps} />
      </div>

    </>
  );
};

export default NewTransferModal;
