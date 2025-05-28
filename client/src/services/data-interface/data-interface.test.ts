import { expect, test, describe } from "vitest";
import getNumOfLicenses from "./data-interface";
import mockLicensesJson from "./mockData.json";
import { BusinessLicense } from "./data-interface";

describe("Testing the data access interface", () => {
  test("getNumOfLicenses returns the proper number of licenses in a given zip code", () => {
    const mockData = mockLicensesJson as BusinessLicense[];

    expect(getNumOfLicenses(mockData, "02122")).toBe(2);
    expect(getNumOfLicenses(mockData, "02130")).toBe(5);
    expect(getNumOfLicenses(mockData, "02210")).toBe(1);
    expect(getNumOfLicenses(mockData, "02128")).toBe(12);
    expect(getNumOfLicenses(mockData, "02134")).toBe(1);
  });

  test("getNumOfLicenses returns proper number of licenses by zip code for certain alcohol type", () => {
    const mockData = mockLicensesJson as BusinessLicense[];
    expect(
      getNumOfLicenses(mockData, "02122", {
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(2);
    expect(
      getNumOfLicenses(mockData, "02130", {
        filterByAlcoholType: "All Alcoholic Beverages",
      })
    ).toBe(2);
    expect(
      getNumOfLicenses(mockData, "02130", {
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(3);
    expect(
      getNumOfLicenses(mockData, "02128", {
        filterByAlcoholType: "Wines and Malt Beverages",
      })
    ).toBe(3);
    expect(
      getNumOfLicenses(mockData, "02128", {
        filterByAlcoholType: "All Alcoholic Beverages",
      })
    ).toBe(9);
  });
});
