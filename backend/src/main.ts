import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

(async () => {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: ["content-type"],
    origin: "http://localhost:3000",
    credentials: true,
  });
  await app.listen(3000);
})();
