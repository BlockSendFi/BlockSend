import React, { FC } from 'react';
import IHomeSection from '../../interfaces/home-section.interface';
import InnerBlock from '../layouts/InnerBlock';

const HomeSection: FC<{ section: IHomeSection }> = ({ section }) => {
  return (
    <div className="py-16 bg-gray-main w-full">
      <InnerBlock>
        <h2 className="text-2xl text-blue-main font-bold text-center">{section.title}</h2>
      </InnerBlock>
    </div>
  );
};

export default HomeSection;
