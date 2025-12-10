import styles from "./license-availability-table.module.css";
import licenseData from "../../../data/licenses.json";
import {
  eligibleBostonZipcodes,
  getZipcodesWithAvailableLicenses,
} from "@/services/data-interface/data-interface";
import CustomTable from "@components/ui/table";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  validateBusinessLicense,
  getAvailableLicensesByZipcode,
  BusinessLicense,
  EligibleBostonZipcode,
} from "@/services/data-interface/data-interface";
import {
  MAX_ALL_ALC_PER_ZIP,
  MAX_AVAILABLE_PER_ZIP,
  MAX_BEER_WINE_PER_ZIP,
} from "@/services/data-interface/data-interface";
import { RowWithSubRows } from "@components/ui/table";
import FilterDropdown from "../../ui/filter-dropdown";
import { Selection } from "react-aria-components";

const formatData = (
  data: BusinessLicense[],
  zipcodeList: Set<EligibleBostonZipcode>,
  licenseType: "All Alcoholic Beverages" | "Wines and Malt Beverages" | null
) => {
  const zips = [...zipcodeList];
  const d = zips.map((zipcode) => {
    // For license filtering, need to assign Row Data based on License Type
    // Need to assign subRowData based on License Type
    // If License Type assigned (via filter), then need to only display content for that type of license
    // i.e. if All Alc Beverages selected, rowData should only show data for All Alc instead of Total (combination of All Alc & Wines/Malt Beverages)
    // and subRowData will only display All Alc data (essentially same data but we keep the subRow just for UI continuity)

    const { totalAvailable, allAlcoholAvailable, beerWineAvailable } =
      getAvailableLicensesByZipcode(data, zipcode);
    const entry = {
      rowData: [
        zipcode,
        String(totalAvailable),
        "-",
        String(MAX_AVAILABLE_PER_ZIP - totalAvailable),
        String(MAX_AVAILABLE_PER_ZIP),
      ],
      subRowData: [
        [
          "All Alcohol Licenses",
          String(allAlcoholAvailable),
          "-",
          String(MAX_ALL_ALC_PER_ZIP - allAlcoholAvailable),
          String(MAX_ALL_ALC_PER_ZIP),
        ],
        [
          "Beer & Wine Licenses",
          String(beerWineAvailable),
          "-",
          String(MAX_BEER_WINE_PER_ZIP - beerWineAvailable),
          String(MAX_BEER_WINE_PER_ZIP),
        ],
      ],
    };

    return entry as RowWithSubRows;
  });

  return d;
};

const licenseTypeOptions = [
  { id: "react-aria-1", name: "All Alcoholic Beverages" as const },
  { id: "react-aria-2", name: "Wines and Malt Beverages" as const },
];

const LicenseAvailabilityTable = () => {
  const [data, setData] = useState<BusinessLicense[]>([]);
  const [zipcodeList, setZipcodeList] = useState<Set<EligibleBostonZipcode>>(
    new Set()
  );
  const [selectedDropdownOptions, setSelectedDropdownOptions] =
    useState<Selection>(new Set());
  const [selectedLicDropdownOptions, setSelectedLicDropdownOptions] =
    useState<Selection>(new Set());
  const [licenseFilter, setLicenseFilter] = useState<
    "All Alcoholic Beverages" | "Wines and Malt Beverages" | null
  >(null);

  useEffect(() => {
    const tmp = [];
    for (const license of licenseData) {
      const validated = validateBusinessLicense(license);
      if (validated.valid === true && license.status === "Granted") {
        tmp.push(validated.data);
      }
    }

    setData(tmp);
    setZipcodeList(eligibleBostonZipcodes);
  }, []);

  const availabilityHeaders = [
    "Zipcode",
    "Licenses Available",
    "Recent Applicants",
    "Licenses Granted",
    "Total Licenses",
  ];

  const formattedData = formatData(data, zipcodeList, licenseFilter);

  const dropdownZipOptions = useMemo(
    () =>
      [...eligibleBostonZipcodes].map((zip, index) => ({
        id: `react-aria-${index + 1}`,
        name: String(zip),
      })),
    []
  );

  const onZipSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedDropdownOptions(new Set(keys as Set<string>));

      const selectedOptions = dropdownZipOptions.filter((option) =>
        (keys as Set<string>).has(option.id.toString())
      );

      // Get zipcodes from selected options
      const zipcodes = selectedOptions.map(
        (option) => option.name as EligibleBostonZipcode // assuming option.name is the zipcode
      );

      if (zipcodes.length) {
        setZipcodeList(new Set(zipcodes));
      } else {
        setZipcodeList(eligibleBostonZipcodes);
      }
    },
    [dropdownZipOptions]
  );

  const onLicenseTypeSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedLicDropdownOptions(new Set(keys as Set<string>));

      const selectedLicenseType = licenseTypeOptions.filter((option) =>
        (keys as Set<string>).has(option.id.toString())
      );

      let licenses;
      if (selectedLicenseType.length == 1) {
        licenses = getZipcodesWithAvailableLicenses(
          data,
          selectedLicenseType[0].name
        );
      } else {
        licenses = getZipcodesWithAvailableLicenses(data);
      }

      const zipcodes = licenses.map((license) => license.zipcode);

      setZipcodeList(new Set(zipcodes));
    },
    [data]
  );

  if (formattedData == null) {
    return null;
  }

  return (
    <section className={styles.licenseAvailabilityTable}>
      <FilterDropdown
        title="Zipcode"
        label="Zipcode dropdown selection"
        options={dropdownZipOptions}
        selected={selectedDropdownOptions}
        onSelectionChange={onZipSelectionChange}
      />
      <FilterDropdown
        title="License Type"
        label="License Type dropdown selection"
        options={licenseTypeOptions}
        selected={selectedLicDropdownOptions}
        onSelectionChange={onLicenseTypeSelectionChange}
      />
      <CustomTable
        ariaLabel="Licenses by Zipcode"
        tableData={formattedData}
        headers={availabilityHeaders}
      />
    </section>
  );
};

export default LicenseAvailabilityTable;
