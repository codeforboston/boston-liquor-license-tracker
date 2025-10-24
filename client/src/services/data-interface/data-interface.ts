// The data interface relies on these constants below to calculate available licenses based off filtering options.

// Does NOT include the 3 Oak Square all alcohol licenses,
// the 15 non-transferable licenses for community spaces, including outdoor spaces, theaters with fewer than 750 seats, and non-profit organizations,
// or the 12 transferable All Alcohol licenses

export const MAX_LICENSES_AVAILABLE = 195; // Total available remaining NON-TRANSFERABLE, ZIPCODE-RESTRICTED Licenses from the 2024 legislation
export const MAX_BEER_WINE_LICENSES = 78;
export const MAX_ALL_ALC_LICENSES = 117;

export const MAX_AVAILABLE_PER_ZIP = 15; // 5 licenses granted per year for 3 years (3 All Alcohol, 2 Wines & Malt Liquor)
export const MAX_ALL_ALC_PER_ZIP = 9;
export const MAX_BEER_WINE_PER_ZIP = 6;

export interface BusinessLicense {
  index: number; 
  entity_number: string;
  business_name: string;
  dba_name: string | null;
  address: string;
  zipcode: EligibleBostonZipcode;
  license_number: string;
  status: string | null;
  alcohol_type: string;
  minutes_date: string,
  application_expiration_date: string,
  file_name: string;
}

// Zipcodes that were granted NON-TRANSFERABLE, ZIPCODE-RESTRICTED Licenses from the 2024 legislation (Not including Oak Square)
export type EligibleBostonZipcode =
  | "02118"
  | "02119"
  | "02121"
  | "02122"
  | "02124"
  | "02125"
  | "02126"
  | "02128"
  | "02129"
  | "02130"
  | "02131"
  | "02132"
  | "02136";

export const eligibleBostonZipcodes: Set<EligibleBostonZipcode> = new Set([
  "02118",
  "02119",
  "02121",
  "02122",
  "02124",
  "02125",
  "02126",
  "02128",
  "02129",
  "02130",
  "02131",
  "02132",
  "02136",
]);

type ValidationResult =
  | { valid: true; data: BusinessLicense }
  | { valid: false; errors: Record<string, string> };

export function isEligibleBostonZipCode(
  zipcode: unknown
): zipcode is EligibleBostonZipcode {
  return (
    typeof zipcode === "string" &&
    eligibleBostonZipcodes.has(zipcode as EligibleBostonZipcode)
  );
}

export function validateBusinessLicense(license: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (typeof license !== "object" || license === null) {
    return { valid: false, errors: { root: "Not an object or is null" } };
  }

  const obj = license as Record<string, unknown>;

  if (typeof obj.index !== "number") {
      errors.index = "Must be a number"
  }

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

  if (!isEligibleBostonZipCode(obj.zipcode)) {
    errors.zipcode = "Must be an Eligible Boston zip code";
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

  if (typeof obj.minutes_date !== "string") {
      errors.minutes_date = "Must be a string"
  }

  if (typeof obj.application_expiration_date !== "string") {
      errors.application_expiration_date = "Must be a string"
  }

  if (typeof obj.file_name !== "string") {
    errors.file_name = "Must be a string";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const validatedBusinessLicense: BusinessLicense = {
    index: Number(obj.index),
    entity_number: String(obj.entity_number),
    business_name: String(obj.business_name),
    dba_name: obj.dba_name === null ? null : String(obj.dba_name),
    address: String(obj.address),
    zipcode: obj.zipcode as EligibleBostonZipcode,
    license_number: String(obj.license_number),
    status: obj.status === null ? null : String(obj.status),
    alcohol_type: String(obj.alcohol_type),
    minutes_date: String(obj.minutes_date),
    application_expiration_date: String(obj.application_expiration_date),
    file_name: String(obj.file_name),
  };

  return { valid: true, data: validatedBusinessLicense };
}

export default function getNumOfLicenses(
  data: BusinessLicense[],
  options?: {
    filterByZipcode?: EligibleBostonZipcode;
    filterByAlcoholType?: string;
  }
): number {
  if (
    options?.filterByZipcode &&
    !isEligibleBostonZipCode(options?.filterByZipcode)
  ) {
    throw new Error(
      "You must enter a zipcode within the City of Boston. See https://data.boston.gov/dataset/zip-codes/resource/a9b44fec-3a21-42ac-a919-06ec4ac20ab8"
    );
  }

  for (const license of data) {
    const validation = validateBusinessLicense(license);

    if (!validation.valid) {
      const errors = Object.entries(validation.errors);
      console.error(`skipped ${license} for the following errors: ${errors}`);
    }
  }

  if (options?.filterByAlcoholType && options?.filterByZipcode) {
    const licensesByZipAndType = data.filter(
      (license) =>
        license.zipcode === options.filterByZipcode &&
        license.alcohol_type === options.filterByAlcoholType
    );

    if (options.filterByAlcoholType === "All Alcoholic Beverages") {
      return MAX_ALL_ALC_PER_ZIP - licensesByZipAndType.length;
    } else if (options.filterByAlcoholType === "Wines and Malt Beverages") {
      return MAX_BEER_WINE_PER_ZIP - licensesByZipAndType.length;
    } else {
      console.error("improper alcohol license type used");
      return -1;
    }
  } else if (options?.filterByZipcode) {
    const licensesByZip = data.filter(
      (license) => license.zipcode === options.filterByZipcode
    );

    return MAX_AVAILABLE_PER_ZIP - licensesByZip.length;
  } else if (options?.filterByAlcoholType) {
    const licensesByType = data.filter(
      (license) => license.alcohol_type === options.filterByAlcoholType
    );

    if (options.filterByAlcoholType === "All Alcoholic Beverages") {
      return MAX_ALL_ALC_LICENSES - licensesByType.length;
    } else if (options.filterByAlcoholType === "Wines and Malt Beverages") {
      return MAX_BEER_WINE_LICENSES - licensesByType.length;
    } else {
      console.error("improper alcohol license type used");
      return -1;
    }
  } else {
    return MAX_LICENSES_AVAILABLE - data.length;
  }
}

interface LicenseAvailability {
  totalAvailable: number;
  allAlcoholAvailable: number;
  beerWineAvailable: number;
}

export function getAvailableLicensesByZipcode(
  data: BusinessLicense[],
  zipcode: EligibleBostonZipcode
): LicenseAvailability {
  if (!isEligibleBostonZipCode(zipcode)) {
    throw new Error(
      "You must enter a zipcode within the City of Boston. See https://data.boston.gov/dataset/zip-codes/resource/a9b44fec-3a21-42ac-a919-06ec4ac20ab8"
    );
  }

  let totalCount = 0;
  let allAlcCount = 0;
  let beerWineCount = 0;

  for (const license of data) {
    if (license.zipcode === zipcode) {
      totalCount++;

      switch (license.alcohol_type) {
        case "All Alcoholic Beverages":
          allAlcCount++;
          break;
        case "Wines and Malt Beverages":
          beerWineCount++;
          break;
      }
    }
  }

  return {
    totalAvailable: MAX_AVAILABLE_PER_ZIP - totalCount,
    allAlcoholAvailable: MAX_ALL_ALC_PER_ZIP - allAlcCount,
    beerWineAvailable: MAX_BEER_WINE_PER_ZIP - beerWineCount,
  };
}

export function getZipcodesWithAvailableLicenses(
  data: BusinessLicense[],
  alcoholType?: "All Alcoholic Beverages" | "Wines and Malt Beverages"
): Array<{
  zipcode: EligibleBostonZipcode;
  totalAvailable: number;
  allAlcoholAvailable: number;
  beerWineAvailable: number;
}> {
  // Get all unique zipcodes from the data
  const uniqueZipcodes = [...new Set(data.map((license) => license.zipcode))];

  const availableZipcodes = [];

  for (const zipcode of uniqueZipcodes) {
    // Get availability for this zipcode
    const { totalAvailable, allAlcoholAvailable, beerWineAvailable } =
      getAvailableLicensesByZipcode(data, zipcode);

    // Check if this zipcode has available licenses based on criteria
    let hasAvailableLicenses = false;

    if (alcoholType) {
      if (
        alcoholType === "All Alcoholic Beverages" &&
        allAlcoholAvailable > 0
      ) {
        hasAvailableLicenses = true;
      } else if (
        alcoholType === "Wines and Malt Beverages" &&
        beerWineAvailable > 0
      ) {
        hasAvailableLicenses = true;
      }
    } else {
      // If no specific alcohol type, check if any licenses are available
      hasAvailableLicenses =
        totalAvailable > 0 || allAlcoholAvailable > 0 || beerWineAvailable > 0;
    }

    if (hasAvailableLicenses) {
      availableZipcodes.push({
        zipcode: zipcode as EligibleBostonZipcode,
        totalAvailable,
        allAlcoholAvailable,
        beerWineAvailable,
      });
    }
  }

  // Sort by zipcode
  return availableZipcodes.sort((a, b) => a.zipcode.localeCompare(b.zipcode));
}
