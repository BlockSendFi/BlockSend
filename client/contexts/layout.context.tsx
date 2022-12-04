import { createContext, useState, ReactElement, ReactNode } from 'react'
import ModalContainer from '../components/common/ModalContainer';
import IModalContext from '../interfaces/modal-context.interface';

interface IProps {
  children: ReactNode
}

const defaultValue = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeModal: () => { },
  modalOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
  openModal: (modalName: string, context?: any, options?: any) => { },
}

export const LayoutContext = createContext(defaultValue)

const LayoutContextProvider = ({ children }: IProps): ReactElement => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modal, setModal] = useState<IModalContext | null>(null)
  const onClose = () => setModal(null)

  return (
    <LayoutContext.Provider
      value={{
        modalOpen: !!modal,
        closeModal: onClose,
        openModal: (modal: string, context = null, opts = {}) => setModal({ modal, context, opts }),
      }}>
      {children}

      <ModalContainer onClose={onClose} modal={modal} />
    </LayoutContext.Provider>
  )
}

export default LayoutContextProvider
