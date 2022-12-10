import React, { FC } from 'react';
import { Dialog } from '@headlessui/react'
import { Inter } from '@next/font/google'
import clsx from 'clsx';
import ModalContent from './ModalContent';
import IModalContext from '../../interfaces/modal-context.interface';
import CloseIcon from './icons/CloseIcon';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', "600", '700'],
  style: ['normal']
})

const ModalContainer: FC<{ onClose: () => void; modal: IModalContext | null }> = ({ onClose, modal }) => {
  return (
    <Dialog open={!!modal} onClose={onClose} className={clsx(
      'fixed z-50 inset-0 flex flex-col items-center justify-center ',
      inter.className
    )}>
      <div
        className={clsx(`bg-white relative mx-6 p-10 rounded-xl z-40 overflow-auto min-w-[480px]`, {
          'overflow-auto': (modal?.opts || {}).overflow
        })}
        style={{
          maxHeight: '96vh'
        }}
      >
        <div className="absolute right-3 top-3">
          <button data-testid="close-modal-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        {
          !!modal && (
            <ModalContent {...modal as IModalContext} />
          )
        }
      </div>
      <Dialog.Overlay className={'fixed inset-0 bg-black-title opacity-30 h-screen w-screen bg-black'} />
    </Dialog>
  );
};

export default ModalContainer;
