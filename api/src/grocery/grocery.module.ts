import { Module } from '@nestjs/common'
import { GroceryController } from './grocery.controller'
import { GroceryService } from './grocery.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [GroceryController],
  providers: [GroceryService],
  exports: [GroceryService],
})
export class GroceryModule {}
