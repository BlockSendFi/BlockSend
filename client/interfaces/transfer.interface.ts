import { TransferStatus } from "../enums/transfer-status.enum";
import IRecipient from "./recipient.interface";

interface ITransfer {
  _id: string;
  recipient: IRecipient;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  status: TransferStatus;
  sufficientBalance: boolean;
  routingOnChainStarted: boolean;
  routingOnChainCompleted: boolean;
  offchainTransferStarted: boolean;
  offchainTransferCompleted: boolean;
}

export default ITransfer
