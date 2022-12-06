import { TransferStatus } from "../enums/transfer-status.enum";

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
  status: TransferStatus
}

export default ITransfer
