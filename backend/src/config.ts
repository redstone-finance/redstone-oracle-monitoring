import * as dotenv from "dotenv";
import { join } from "path";
import { readFileSync } from "fs";

dotenv.config({ path: join(__dirname, "../../../../.env") });

function getFromEnv(envName: string) {
  const valueFromEnv = process.env[envName];
  if (!valueFromEnv) {
    throw new Error(`Missing ${envName} env variable`);
  }
  return valueFromEnv;
}

export const mongoDbUrl = getFromEnv("MONGO_DB_URL");

export const dataServicesToCheck = readConfigJSON(
  getFromEnv("DATA_SERVICES_CONFIG")
);

function readConfigJSON(filePath: string): any {
  const content = readFileSync(
    `${join(`${__dirname}/../../${filePath}`)}`,
    "utf-8"
  );
  try {
    return JSON.parse(content);
  } catch (e: any) {
    throw new Error(`File "${filePath}" does not contain a valid JSON`);
  }
}
