import { Ajv } from "ajv"
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

    //check for sequential indexing
    ajv.addKeyword({
        keyword: "sequentialIndexes",
        type: "array",
        errors: true,
        validate: function (schema: boolean, data: { index: number }[]) {   
            if (!schema) return true; 
            for (let i = 0; i < data.length; i++) {
                if (data[i].index !== i + 1) {
                    return false;
                }
            }
            return true;
        },
    });

    const validate = ajv.compile(schemaJson);

    if (!validate(licenseData)) {
        const formattedErrors = ajv.errorsText(validate.errors ?? [], { separator: "\n" });
        console.error("License data validation failed:");
        console.error(formattedErrors);
        console.error(JSON.stringify(validate.errors, null, 2));
        process.exit(1); 
    }

    const invariantErrors = checkInvariants(licenseData as LicenseRecord[]);
    if (invariantErrors.length > 0) {
        console.error("License data invariant checks failed:");
        invariantErrors.forEach((e) => console.error(`  - ${e}`));
        process.exit(1);
    }
    console.log("All licenses are valid");
}

// Chapter 202 of the Acts of 2024 limits. Keep in sync with
// client/src/services/data-interface/data-interface.ts.
const ELIGIBLE_ZIPCODES = new Set([
    "02118", "02119", "02121", "02122", "02124", "02125", "02126",
    "02128", "02129", "02130", "02131", "02132", "02136",
]);
const MAX_ALL_ALC_PER_ZIP = 9;
const MAX_BEER_WINE_PER_ZIP = 6;
const MAX_ALL_ALC_LICENSES = 117;
const MAX_BEER_WINE_LICENSES = 78;
const ALL_ALC = "All Alcoholic Beverages";

interface LicenseRecord {
    license_number: string;
    zipcode: string;
    status: string;
    alcohol_type: string;
    application_expiration_date: string | null;
    granted_date?: string | null;
}

/**
 * Business-rule checks that a schema cannot express. A failure here almost
 * always means a parsing bug (e.g. a vote matched to the wrong application),
 * so the pipeline stops before opening a pull request.
 */
export function checkInvariants(records: LicenseRecord[]): string[] {
    const errors: string[] = [];
    const seen = new Set<string>();
    const perZip = new Map<string, { allAlc: number; beerWine: number }>();
    let allAlc = 0;
    let beerWine = 0;

    for (const r of records) {
        if (seen.has(r.license_number)) {
            errors.push(`Duplicate license_number ${r.license_number}`);
        }
        seen.add(r.license_number);

        if (!ELIGIBLE_ZIPCODES.has(r.zipcode)) {
            errors.push(`${r.license_number}: zipcode ${r.zipcode} is not a Chapter 202 zip code`);
        }

        if (r.status !== "Granted") continue;

        if (!r.granted_date) {
            errors.push(`${r.license_number}: Granted without granted_date`);
        }
        if (r.application_expiration_date !== null) {
            errors.push(`${r.license_number}: Granted but application_expiration_date is set`);
        }
        const counts = perZip.get(r.zipcode) ?? { allAlc: 0, beerWine: 0 };
        if (r.alcohol_type === ALL_ALC) {
            counts.allAlc++;
            allAlc++;
        } else {
            counts.beerWine++;
            beerWine++;
        }
        perZip.set(r.zipcode, counts);
    }

    for (const [zip, c] of perZip) {
        if (c.allAlc > MAX_ALL_ALC_PER_ZIP) {
            errors.push(`${zip}: ${c.allAlc} All Alcoholic licenses granted (max ${MAX_ALL_ALC_PER_ZIP})`);
        }
        if (c.beerWine > MAX_BEER_WINE_PER_ZIP) {
            errors.push(`${zip}: ${c.beerWine} Wines and Malt licenses granted (max ${MAX_BEER_WINE_PER_ZIP})`);
        }
    }
    if (allAlc > MAX_ALL_ALC_LICENSES) {
        errors.push(`${allAlc} All Alcoholic licenses granted citywide (max ${MAX_ALL_ALC_LICENSES})`);
    }
    if (beerWine > MAX_BEER_WINE_LICENSES) {
        errors.push(`${beerWine} Wines and Malt licenses granted citywide (max ${MAX_BEER_WINE_LICENSES})`);
    }
    return errors;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
