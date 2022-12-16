import Image from 'next/image';
import React, { FC } from 'react';
import IHomeSection from '../../interfaces/home-section.interface';
import InnerBlock from '../layouts/InnerBlock';

const HomeSection: FC<{ section: IHomeSection }> = ({ section }) => {
  return (
    <div className="py-16 bg-gray-main w-full">
      <InnerBlock>
        <div className="flex flex-col gap-4 items-center">
          {
            !!section.icon && (<Image src={section.icon} alt={section.title} />)
          }
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl text-blue-main font-bold text-center">{section.title}</h2>

            {
              !!section.description && (<div className="opacity-60">{section.description}</div>)
            }
          </div>
        </div>
      </InnerBlock>
    </div>
  );
};

export default HomeSection;
