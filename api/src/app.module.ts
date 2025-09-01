import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { GroceryModule } from './grocery/grocery.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ShoppingListModule } from './shoppingList/shopping-list.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV}`, 
        '.env', 
        `.env.${process.env.NODE_ENV}.local`, 
        '.env.local'
      ],
      isGlobal: true,
      load: [config],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    ShoppingListModule,
    GroceryModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
