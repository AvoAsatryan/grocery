import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GithubAuthMiddleware } from './github-auth.middleware';
import { AuthorizationService } from './authorization.service';
import { OwnershipGuard } from './guards/ownership.guard';

@Module({
  imports: [PrismaModule],
  providers: [
    GithubAuthMiddleware,
    AuthorizationService,
    OwnershipGuard,
  ],
  exports: [
    GithubAuthMiddleware,
    AuthorizationService,
    OwnershipGuard,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GithubAuthMiddleware)
      .forRoutes('*'); // Apply to all routes or specify specific routes
  }
}
