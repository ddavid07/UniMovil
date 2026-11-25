import { Module } from '@nestjs/common';
import { AccountController } from './account/account.controller';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { DatabaseService } from './database/database.service';
import { HealthController } from './health.controller';
import {
  IncidentsController,
  OwnIncidentsController,
} from './incidents/incidents.controller';
import { IncidentsService } from './incidents/incidents.service';

@Module({
  controllers: [
    HealthController,
    AuthController,
    AccountController,
    IncidentsController,
    OwnIncidentsController,
  ],
  providers: [DatabaseService, AuthService, AuthGuard, IncidentsService],
})
export class AppModule {}
