import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { RoutesModule } from "./routes/routes.module.js";

@Module({
  imports: [RoutesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
