import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import LogoText from '../../assets/logo-text.svg';
import clsx from 'clsx'

const MENU_ITEMS = [
  {
    title: 'Accueil',
    url: '/'
  },
  {
    title: 'Tarifs',
    url: '/tarifs'
  },
  {
    title: 'Entreprise',
    url: '/entreprise'
  },
  {
    title: 'Se connecter',
    url: '/login'
  },
]

const Navbar: FC<{ variant?: boolean }> = ({ variant = false }) => {
  const router = useRouter()

  const onClick = () => {
    router.push('/')
  }

  return (
    <div className="h-[80px] px-8 flex items-center justify-between">
      <Image src={LogoText} alt={"BlockSend: Worldwide Remittance"} onClick={onClick} className="cursor-pointer" width={160} />

      <div className="flex items-center gap-8">
        {
          MENU_ITEMS.map((menuItem, index) => (
            <Link href={menuItem.url}
              className={clsx("font-semibold", {
                "text-white": !variant,
                "text-blue-main": variant,
              })} key={index}>
              {menuItem.title}
            </Link>
          ))
        }
      </div>
    </div>
  );
};

export default Navbar;
