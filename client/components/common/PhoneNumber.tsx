import React, { FC } from 'react';

const PhoneNumber: FC<{ phoneNumber: string }> = ({ phoneNumber }) => {
  const num = `${phoneNumber.substring(0, 3)} ${phoneNumber.substring(3, 6)} ${phoneNumber.substring(6, phoneNumber.length)}`;

  return (
    <span>
      {num}
    </span>
  );
};

export default PhoneNumber;
