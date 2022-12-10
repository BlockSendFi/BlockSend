import React, { FC } from 'react';
import { ModalEnum } from '../../enums/modal.enum';
import IModalContext from '../../interfaces/modal-context.interface';
import AddContactModal from '../contact/AddContactModal';
import NewTransferModal from '../transfer/NewTransferModal';

const ModalContent: FC<IModalContext> = ({ modal, context }) => {
  const modalContext = context ?? {}
  switch (modal) {
    case ModalEnum.ADD_CONTACT:
      return <AddContactModal {...modalContext} />

    case ModalEnum.NEW_TRANSFER:
      return <NewTransferModal {...modalContext} />

    default:
      return null
  }
}

export default ModalContent;
