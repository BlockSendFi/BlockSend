import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useContext } from 'react';
import LogoText from '../../assets/logo-text.svg';
import LogoTextBlue from '../../assets/logo-text-blue.svg';
import clsx from 'clsx'
import { AuthContext } from '../../contexts/auth.context';
import AuthPopover from './AuthPopover';

const MENU_ITEMS = [
  {
    title: 'Accueil',
    url: '/'
  },
  {
    title: 'Tarifs',
    url: '/'
  }, {
    title: 'Entreprise',
    url: '/'
  }
]

const Navbar: FC<{ variant?: boolean }> = ({ variant = false }) => {
  const router = useRouter()
  const { accessToken } = useContext(AuthContext)

  const onClick = () => router.push('/')


  const Logo = accessToken ? LogoTextBlue : LogoText

  return (
    <div className="h-[80px] px-8 flex items-center justify-between">
      <Image src={Logo} alt={"BlockSend: Worldwide Remittance"} onClick={onClick} className="cursor-pointer" width={160} />

      <div className="flex items-center gap-8">
        {
          MENU_ITEMS.map((menuItem, index) => (
            <Link href={menuItem.url}
              className={clsx("font-semibold", {
                "text-white": !variant,
                "text-blue-main": variant,
              })}
              key={index}
            >
              {menuItem.title}
            </Link>
          ))
        }

        {
          accessToken ? (<AuthPopover />) : (
            <Link href={"/login"}
              className={clsx("font-semibold", {
                "text-white": !variant,
                "text-blue-main": variant,
              })}
            >
              {'Se connecter'}
            </Link>
          )
        }
      </div>
    </div>
  );
};

export default Navbar;
