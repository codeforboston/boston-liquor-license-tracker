export interface BusinessLicense {
  entity_number: string;
  business_name: string;
  dba_name: string | null;
  address: string;
  zipcode: BostonZipCode;
  license_number: string;
  status: string | null;
  alcohol_type: string;
  file_name: string;
}

type BostonZipCode =
  | "02021"
  | "02026"
  | "02108"
  | "02109"
  | "02110"
  | "02111"
  | "02113"
  | "02114"
  | "02115"
  | "02116"
  | "02118"
  | "02119"
  | "02120"
  | "02121"
  | "02122"
  | "02124"
  | "02125"
  | "02126"
  | "02127"
  | "02128"
  | "02129"
  | "02130"
  | "02131"
  | "02132"
  | "02134"
  | "02135"
  | "02136"
  | "02151"
  | "02152"
  | "02163"
  | "02186"
  | "02199"
  | "02203"
  | "02210"
  | "02215"
  | "02459"
  | "02467";

const validBostonZipCodes: Set<BostonZipCode> = new Set([
  "02021",
  "02026",
  "02108",
  "02109",
  "02110",
  "02111",
  "02113",
  "02114",
  "02115",
  "02116",
  "02118",
  "02119",
  "02120",
  "02121",
  "02122",
  "02124",
  "02125",
  "02126",
  "02127",
  "02128",
  "02129",
  "02130",
  "02131",
  "02132",
  "02134",
  "02135",
  "02136",
  "02151",
  "02152",
  "02163",
  "02186",
  "02199",
  "02203",
  "02210",
  "02215",
  "02459",
  "02467",
]);

type ValidationResult =
  | { valid: true; data: BusinessLicense }
  | { valid: false; errors: Record<string, string> };

function isBostonZipCode(zipcode: unknown): zipcode is BostonZipCode {
  return (
    typeof zipcode === "string" &&
    validBostonZipCodes.has(zipcode as BostonZipCode)
  );
}

function validateBusinessLicense(license: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (typeof license !== "object" || license === null) {
    return { valid: false, errors: { root: "Not an object or is null" } };
  }

  const obj = license as Record<string, unknown>;

  if (typeof obj.entity_number !== "string") {
    errors.entity_number = "Must be a string";
  }

  if (typeof obj.business_name !== "string") {
    errors.business_name = "Must be a string";
  }

  if (obj.dba_name !== null && typeof obj.dba_name !== "string") {
    errors.dba_name = "Must be a string or null";
  }

  if (typeof obj.address !== "string") {
    errors.address = "Must be a string";
  }

  if (!isBostonZipCode(obj.zipcode)) {
    errors.zipcode = "Must be a valid Boston zip code";
  }

  if (typeof obj.license_number !== "string") {
    errors.license_number = "Must be a string";
  }

  if (obj.status !== null && typeof obj.status !== "string") {
    errors.status = "Must be a string or null";
  }

  if (typeof obj.alcohol_type !== "string") {
    errors.alcohol_type = "Must be a string";
  }

  if (typeof obj.file_name !== "string") {
    errors.file_name = "Must be a string";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const validatedBusinessLicense: BusinessLicense = {
    entity_number: String(obj.entity_number),
    business_name: String(obj.business_name),
    dba_name: obj.dba_name === null ? null : String(obj.dba_name),
    address: String(obj.address),
    zipcode: obj.zipcode as BostonZipCode,
    license_number: String(obj.license_number),
    status: obj.status === null ? null : String(obj.status),
    alcohol_type: String(obj.alcohol_type),
    file_name: String(obj.file_name),
  };

  return { valid: true, data: validatedBusinessLicense };
}

export default function getNumOfLicenses(
  data: BusinessLicense[],
  options?: {
    filterByZipcode?: BostonZipCode;
    filterByAlcoholType?: string;
  }
): number {
  if (options?.filterByZipcode && !isBostonZipCode(options?.filterByZipcode)) {
    throw new Error(
      "You must enter a zipcode within the City of Boston. See https://data.boston.gov/dataset/zip-codes/resource/a9b44fec-3a21-42ac-a919-06ec4ac20ab8"
    );
  }

  for (const license of data) {
    const validation = validateBusinessLicense(license);

    if (!validation.valid) {
      const errs = [];
      for (const err in validation.errors) {
        errs.push(err);
      }
      throw new Error(`Business License missing required fields: ${errs}`);
    }
  }

  if (options?.filterByAlcoholType && options?.filterByZipcode) {
    const licenseByZipAndType = data.filter(
      (license) =>
        license.zipcode === options.filterByZipcode &&
        license.alcohol_type === options.filterByAlcoholType
    );

    return licenseByZipAndType.length;
  } else if (options?.filterByZipcode) {
    const licensesByZip = data.filter(
      (license) => license.zipcode === options.filterByZipcode
    );

    return licensesByZip.length;
  } else if (options?.filterByAlcoholType) {
    const licensesByType = data.filter(
      (license) => license.alcohol_type === options.filterByAlcoholType
    );

    return licensesByType.length;
  } else {
    return data.length;
  }
}
