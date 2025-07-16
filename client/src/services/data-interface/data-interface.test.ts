import { expect, test, describe } from "vitest";
import getNumOfLicenses from "./data-interface";
import mockLicensesJson from "./mockData.json";
import { BusinessLicense } from "./data-interface";

// INFO on these constants in the data-interface.ts file
import {
  MAX_LICENSES_AVAILABLE,
  MAX_BEER_WINE_LICENSES,
  MAX_ALL_ALC_LICENSES,
  MAX_AVAILABLE_PER_ZIP,
  MAX_ALL_ALC_PER_ZIP,
  MAX_BEER_WINE_PER_ZIP
} from "./data-interface";

describe("Testing the data access interface", () => {
  test("return number of all city-wide licenses (all zipcodes & all alcohol types)", () => {
    const mockData = mockLicensesJson as BusinessLicense[];
    const expected = MAX_LICENSES_AVAILABLE - 47;
    expect(getNumOfLicenses(mockData)).toBe(expected);
  });

  test("returns the number of licenses by zip code for all alcohol types", () => {
    const mockData = mockLicensesJson as BusinessLicense[];

    expect(getNumOfLicenses(mockData, { filterByZipcode: "02122" })).toBe(
      MAX_AVAILABLE_PER_ZIP - 2
    );
    expect(getNumOfLicenses(mockData, { filterByZipcode: "02130" })).toBe(
      MAX_AVAILABLE_PER_ZIP - 5
    );
    expect(getNumOfLicenses(mockData, { filterByZipcode: "02210" })).toBe(
      MAX_AVAILABLE_PER_ZIP - 1
    );
    expect(getNumOfLicenses(mockData, { filterByZipcode: "02128" })).toBe(
      MAX_AVAILABLE_PER_ZIP - 12
    );
    expect(getNumOfLicenses(mockData, { filterByZipcode: "02134" })).toBe(
      MAX_AVAILABLE_PER_ZIP - 1
    );
  });

  test("returns number of licenses by alcohol type for all zip codes", () => {
    const mockData = mockLicensesJson as BusinessLicense[];

    expect(
      getNumOfLicenses(mockData, {
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(MAX_BEER_WINE_LICENSES - 12);
    expect(
      getNumOfLicenses(mockData, {
        filterByAlcoholType: "All Alcoholic Beverages",
      })
    ).toBe(MAX_ALL_ALC_LICENSES - 35);
  });

  test("returns number of licenses by both zip code & alcohol type", () => {
    const mockData = mockLicensesJson as BusinessLicense[];
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02122",
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(MAX_BEER_WINE_PER_ZIP - 2);
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02130",
        filterByAlcoholType: "All Alcoholic Beverages",
      })
    ).toBe(MAX_ALL_ALC_PER_ZIP - 2);
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02130",
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(MAX_BEER_WINE_PER_ZIP - 3);
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02128",
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(MAX_BEER_WINE_PER_ZIP - 3);
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02128",
        filterByAlcoholType: "All Alcoholic Beverages",
      })
    ).toBe(MAX_ALL_ALC_PER_ZIP - 9);
  });
});
