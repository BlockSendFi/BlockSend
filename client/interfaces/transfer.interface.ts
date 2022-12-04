import { TransferStatusEnum } from "../enums/transfer-status.enum";

interface ITransfer {
  _id: string;
  recipient: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  status: TransferStatusEnum
}

export default ITransfer
