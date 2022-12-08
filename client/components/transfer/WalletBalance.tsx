import React from 'react';
import Button from '../common/Button';

const WalletBalance = () => {
  return (
    <div className="px-4 py-6 border rounded-2xl  border-gray-200 w-[260px] self-start">
      <h2 className="text-xl font-bold text-center">{"Votre wallet"}</h2>

      <hr className="my-2" />
      <div className="mt-2 flex flex-col gap-6 justify-center">
        <div className="flex flex-col gap-2">
          <div className="text-2xl gap-2 flex items-center py-2 justify-center">

            <div className="text-3xl font-semibold">
              {"10200"}
            </div>

            <div className="font-bold text-sm">
              {"BKSD"}
            </div>
          </div>

          <Button title="Acheter du BKSD" color="blue-light" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl gap-2 flex items-center py-2 justify-center">

            <div className="text-3xl font-semibold">
              {"0"}
            </div>

            <div className="font-bold text-sm">
              {"USDC"}
            </div>
          </div>
          <div className="text-center">
            {"Reçus en récompense"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletBalance;
