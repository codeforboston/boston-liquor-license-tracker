import { expect, test, describe } from "vitest";
import getNumOfLicenses from "./data-interface";
import mockLicensesJson from "./mockData.json";
import { BusinessLicense } from "./data-interface";
import {
  getAvailableLicensesByZipcode,
  getZipcodesWithAvailableLicenses,
  isEligibleBostonZipCode,
} from "./data-interface";

// INFO on these constants in the data-interface.ts file
import {
  MAX_LICENSES_AVAILABLE,
  MAX_BEER_WINE_LICENSES,
  MAX_ALL_ALC_LICENSES,
  MAX_AVAILABLE_PER_ZIP,
  MAX_ALL_ALC_PER_ZIP,
  MAX_BEER_WINE_PER_ZIP,
} from "./data-interface";

// **FILTER MOCK DATA TO ONLY ELIGIBLE BOSTON ZIPCODES**
const filteredMockData = (mockLicensesJson as BusinessLicense[]).filter(
  (license) => isEligibleBostonZipCode(license.zipcode)
);

describe("Testing the data access interface", () => {
  describe("getAvailableLicensesByZipcode", () => {
    test("returns the number of licenses by zip code for all alcohol types", () => {
      const mockData = filteredMockData;

      expect(getAvailableLicensesByZipcode(mockData, "02122")).toStrictEqual({
        allAlcoholAvailable: MAX_ALL_ALC_PER_ZIP - 0,
        beerWineAvailable: MAX_BEER_WINE_PER_ZIP - 2,
        totalAvailable: MAX_AVAILABLE_PER_ZIP - 2,
      });
      expect(getAvailableLicensesByZipcode(mockData, "02130")).toStrictEqual({
        allAlcoholAvailable: MAX_ALL_ALC_PER_ZIP - 2,
        beerWineAvailable: MAX_BEER_WINE_PER_ZIP - 3,
        totalAvailable: MAX_AVAILABLE_PER_ZIP - 5,
      });
    });
    test("should handle empty data", () => {
      expect(getAvailableLicensesByZipcode([], "02122")).toStrictEqual({
        totalAvailable: MAX_AVAILABLE_PER_ZIP,
        allAlcoholAvailable: MAX_ALL_ALC_PER_ZIP,
        beerWineAvailable: MAX_BEER_WINE_PER_ZIP,
      });
    });
  });

  describe("getZipcodesWithAvailableLicenses", () => {
    const mockData = filteredMockData;

    test("should filter and sort zipcodes correctly", () => {
      const allResults = getZipcodesWithAvailableLicenses(mockData);
      const allAlcoholResults = getZipcodesWithAvailableLicenses(
        mockData,
        "All Alcoholic Beverages"
      );
      const beerWineResults = getZipcodesWithAvailableLicenses(
        mockData,
        "Wines and Malt Beverages"
      );

      // Results should be sorted by zipcode
      const allZipcodes = allResults.map((item) => item.zipcode);
      expect(allZipcodes).toEqual([...allZipcodes].sort());

      // Filtered results should only include zipcodes with availability for that type
      allAlcoholResults.forEach((item) => {
        expect(item.allAlcoholAvailable).toBeGreaterThan(0);
      });

      beerWineResults.forEach((item) => {
        expect(item.beerWineAvailable).toBeGreaterThan(0);
      });

      // Should handle empty data
      expect(getZipcodesWithAvailableLicenses([])).toEqual([]);
    });
  });

  describe("getNumLicenses", () => {
    test("return number of all city-wide licenses (all zipcodes & all alcohol types)", () => {
      const mockData = filteredMockData;
      const expected = MAX_LICENSES_AVAILABLE - 32;
      expect(getNumOfLicenses(mockData)).toBe(expected);
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
    });
  });
});
