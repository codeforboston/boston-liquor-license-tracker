import { expect, test, describe } from "vitest";
import getNumOfLicenses from "./data-interface";
import mockLicensesJson from "./mockData.json";
import { BusinessLicense } from "./data-interface";

describe("Testing the data access interface", () => {
  test("return number of all city-wide licenses (all zipcodes & all alcohol types)", () => {
    const mockData = mockLicensesJson as BusinessLicense[];

    expect(getNumOfLicenses(mockData)).toBe(47);
  });

  test("returns the number of licenses by zip code for all alcohol types", () => {
    const mockData = mockLicensesJson as BusinessLicense[];

    expect(getNumOfLicenses(mockData, { filterByZipcode: "02122" })).toBe(2);
    expect(getNumOfLicenses(mockData, { filterByZipcode: "02130" })).toBe(5);
    expect(getNumOfLicenses(mockData, { filterByZipcode: "02210" })).toBe(1);
    expect(getNumOfLicenses(mockData, { filterByZipcode: "02128" })).toBe(12);
    expect(getNumOfLicenses(mockData, { filterByZipcode: "02134" })).toBe(1);
  });

  test("returns number of licenses by alcohol type for all zip codes", () => {
    const mockData = mockLicensesJson as BusinessLicense[];

    expect(
      getNumOfLicenses(mockData, {
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(12);
    expect(
      getNumOfLicenses(mockData, {
        filterByAlcoholType: "All Alcoholic Beverages",
      })
    ).toBe(35);
  });

  test("returns number of licenses by both zip code & alcohol type", () => {
    const mockData = mockLicensesJson as BusinessLicense[];
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02122",
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(2);
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02130",
        filterByAlcoholType: "All Alcoholic Beverages",
      })
    ).toBe(2);
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02130",
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(3);
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02128",
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(3);
    expect(
      getNumOfLicenses(mockData, {
        filterByZipcode: "02128",
        filterByAlcoholType: "All Alcoholic Beverages",
      })
    ).toBe(9);
  });
});
