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

const validBostonZipCodes: Set<string> = new Set([
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

function isBostonZipCode(zipcode: unknown): zipcode is BostonZipCode {
  return typeof zipcode === "string" && validBostonZipCodes.has(zipcode);
}

export default function getNumOfLicenses(
  data: BusinessLicense[],
  filterByZipcode: BostonZipCode,
  options?: {
    filterByAlcoholType: string;
  }
): number {
  if (!isBostonZipCode(filterByZipcode)) {
    throw new Error(
      "You must enter a zipcode within the City of Boston. See https://data.boston.gov/dataset/zip-codes/resource/a9b44fec-3a21-42ac-a919-06ec4ac20ab8"
    );
  }

  const result = [...data];

  const licensesByZip = result.filter(
    (license) => license.zipcode === filterByZipcode
  );

  if (options?.filterByAlcoholType) {
    const licenseByZipAndType = result.filter(
      (license) =>
        license.zipcode === filterByZipcode &&
        license.alcohol_type === options.filterByAlcoholType
    );

    return licenseByZipAndType.length;
  }

  return licensesByZip.length;
}
