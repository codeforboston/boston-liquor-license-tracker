import {Ajv, JSONSchemaType} from "ajv"
import formatsPlugin from 'ajv-formats';
import { LICENSE_SCHEMA_PATH, LICENSES_JSON} from "./paths.js"
import path from "path"
import fs from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const licenseSchemaPath = path.join(__dirname, "..", LICENSE_SCHEMA_PATH);
const licenseDataPath = path.join(__dirname, "..", LICENSES_JSON)


async function main() {
    const licenseSchemaUrl = pathToFileURL(licenseSchemaPath);
    const licenseDataUrl = pathToFileURL(licenseDataPath);
    const schemaJson = JSON.parse(await fs.readFile(licenseSchemaUrl, "utf8"));
    const licenseData = JSON.parse(await fs.readFile(licenseDataUrl, "utf8"))

    const ajv = new Ajv({ allErrors: true });
    formatsPlugin.default(ajv);

    const validate = ajv.compile(schemaJson);

    if (!validate(licenseData)) {
        const formattedErrors = ajv.errorsText(validate.errors ?? [], { separator: "\n" });
        console.error("License data validation failed:");
        console.error(formattedErrors);
        console.error(JSON.stringify(validate.errors, null, 2));
        process.exit(1); 
    } else {
        console.log("All licenses are valid");
    }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
