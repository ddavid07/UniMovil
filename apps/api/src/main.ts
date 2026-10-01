import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

const localEnvironmentFile = resolve(process.cwd(), "../../.env.local");
// El sufijo es fijo y el proceso lo ejecuta el workspace de la API.
// eslint-disable-next-line security/detect-non-literal-fs-filename
if (existsSync(localEnvironmentFile)) {
  process.loadEnvFile(localEnvironmentFile);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.API_CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins?.length ? allowedOrigins : ["http://localhost:5173"],
  });

  const port = Number(process.env.API_PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("API_PORT debe ser un puerto válido entre 1 y 65535.");
  }

  await app.listen(port);
}

await bootstrap();
