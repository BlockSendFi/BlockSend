import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TransferStatus } from 'src/enums/transfer-status.enum';

export type TransferDocument = HydratedDocument<Transfer>;

@Schema()
export class Recipient {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  phoneNumber: string;
}

@Schema({ timestamps: true })
export class Transfer {
  _id: Types.ObjectId;

  @Prop({ default: TransferStatus.PENDING })
  status: TransferStatus;

  @Prop({ required: false })
  amount: number;

  @Prop({ required: false })
  amountWithoutFees?: number;

  @Prop({ _id: false })
  recipient: Recipient;

  @Prop()
  userWalletAddress: string;

  @Prop()
  offchainProviderTrackingId?: string;

  @Prop()
  offchainTransferTx?: string;

  // @Prop()
  // tx?: string;

  @Prop()
  user: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);
