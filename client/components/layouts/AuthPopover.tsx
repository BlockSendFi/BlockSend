import React, { FC, useContext } from 'react';
import { Popover } from '@headlessui/react'
import { AuthContext } from '../../contexts/auth.context';
import { useRouter } from 'next/router';
import Link from 'next/link';
import clsx from 'clsx';

const AuthPopover: FC<{ className?: string }> = ({ className = "" }) => {
  const router = useRouter()
  const color = router.pathname === "/app" ? "blue-main" : "white"

  const { logout } = useContext(AuthContext)

  return (
    <Popover className={clsx("relative", className)}>
      <Popover.Button>
        <div className={"flex gap-2 items-center relative"}>
          <div className={`flex-grow text-${color}`}>{"Mon compte"}</div>
          <svg
            className={`stroke-${color}`}
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1.02637L6 6.02637L11 1.02637"
              stroke="current"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Popover.Button>
      <Popover.Panel className="absolute z-40 flex flex-col overflow-auto text-sm bg-white rounded shadow-xl time-slot lg:text-base md:text-md whitespace-nowrap max-h-60">
        {() => (
          <>
            <div
              className="flex items-center hover:bg-gray-100 px-4 py-3"
            >
              <Link href="/app">
                {"Mes informations"}
              </Link>
            </div>
            <div
              className="flex items-center cursor-pointer hover:bg-gray-100 px-4 py-3"
              onClick={logout}
            >
              {"Se déconnecter"}
            </div>
          </>
        )}
      </Popover.Panel>
    </Popover>
  );
};

export default AuthPopover;
