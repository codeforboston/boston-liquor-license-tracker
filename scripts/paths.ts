import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const LICENSES_JSON = requireEnv("LICENSES_JSON");
export const LAST_PROCESSED_DATE_JSON = requireEnv("LAST_PROCESSED_DATE_JSON"); 
export const BOSTON_URL = requireEnv("BOSTON_URL");