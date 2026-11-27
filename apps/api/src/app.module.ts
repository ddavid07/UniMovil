import { Module } from '@nestjs/common';
import { AccountController } from './account/account.controller';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { RolesGuard } from './auth/roles.guard';
import { DatabaseService } from './database/database.service';
import { HealthController } from './health.controller';
import { IncidentAuditService } from './incidents/incident-audit.service';
import { IncidentManagementController } from './incidents/incident-management.controller';
import { IncidentManagementService } from './incidents/incident-management.service';
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
    IncidentManagementController,
  ],
  providers: [
    DatabaseService,
    AuthService,
    AuthGuard,
    RolesGuard,
    IncidentsService,
    IncidentAuditService,
    IncidentManagementService,
  ],
})
export class AppModule {}
