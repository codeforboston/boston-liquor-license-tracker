import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { LAST_PROCESSED_DATE_JSON } from "./paths.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dateFilePath = path.join(__dirname, "..", LAST_PROCESSED_DATE_JSON);

async function writeOrUpdateLastProcessedDate(lastProcessedDate: string) {
  try{
  const data = { date: lastProcessedDate };
  await fs.writeFile(dateFilePath, JSON.stringify(data) );
  console.log(`Updated last processed date to: ${lastProcessedDate}`);
  }catch(err){
    throw err
  }
}

const dateArg = process.argv[2];
if (!dateArg) {
  console.error("No date provided");
  process.exit(1);
}

writeOrUpdateLastProcessedDate(dateArg);