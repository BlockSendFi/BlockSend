import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        '.env',
      ],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get('MONGO_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
