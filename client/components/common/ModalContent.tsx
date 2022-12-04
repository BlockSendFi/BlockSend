import React, { FC } from 'react';
import { ModalEnum } from '../../enums/modal.enum';
import IModalContext from '../../interfaces/modal-context.interface';
import AddContactModal from '../contact/AddContactModal';

const ModalContent: FC<IModalContext> = ({ modal, context }) => {
  const modalContext = context ?? {}
  switch (modal) {
    case ModalEnum.ADD_CONTACT:
      return <AddContactModal {...modalContext} />

    default:
      return null
  }
}

export default ModalContent;
