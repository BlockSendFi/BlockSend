import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactController } from './controllers/contact.controller';
import { ContactService } from './services/contact.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Contact, ContactSchema } from './schemas/contact.schema';
import { Transfer, TransferSchema } from './schemas/transfer.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
      { name: Transfer.name, schema: TransferSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get('MONGO_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class AppModule { }
