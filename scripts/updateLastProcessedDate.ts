import fs from "fs/promises";
import path from "path";

const dateFilePath = path.join(__dirname, "../data/lastProcessedDate.json");

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
  console.error("❌ No date provided");
  process.exit(1);
}

writeOrUpdateLastProcessedDate(dateArg);
