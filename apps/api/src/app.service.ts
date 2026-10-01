import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth(): { status: "ok"; service: "unimovil-api" } {
    return { status: "ok", service: "unimovil-api" };
  }
}
