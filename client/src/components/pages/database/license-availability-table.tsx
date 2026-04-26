import styles from "./license-availability-table.module.css";
import licenseData from "../../../data/licenses.json";
import CustomTable from "@components/ui/table";
import { useState, useEffect, useCallback } from "react";
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
import ZipCodeFilter from "./zip-code-filter";
import { Selection } from "react-aria-components";
import { FormattedMessage } from "react-intl";

const getRowData = (
  zipcode: EligibleBostonZipcode,
  licenseType: "All Alcoholic Beverages" | "Wines and Malt Beverages" | null,
  totalAvailable: number,
  allAlcoholAvailable: number,
  beerWineAvailable: number,
  totalApplicantsTotal: number,
  totalApplicantsAllAlc: number,
  totalApplicantsBeerWine: number,
  openApplicationsTotal: number,
  openApplicationsAllAlc: number,
  openApplicationsBeerWine: number,
) => {
  let rowData;
  let subRowData;

  if (!licenseType) {
    rowData = [
      zipcode,
      String(MAX_AVAILABLE_PER_ZIP),
      String(totalAvailable),
      String(totalApplicantsTotal),
      String(openApplicationsTotal),
      String(MAX_AVAILABLE_PER_ZIP - totalAvailable),
    ]
    subRowData = [
      [
        "All Alcohol Licenses",
        String(MAX_ALL_ALC_PER_ZIP),
        String(allAlcoholAvailable),
        String(totalApplicantsAllAlc),
        String(openApplicationsAllAlc),
        String(MAX_ALL_ALC_PER_ZIP - allAlcoholAvailable),
      ],
      [
        "Beer & Wine Licenses",
        String(MAX_BEER_WINE_PER_ZIP),
        String(beerWineAvailable),
        String(totalApplicantsBeerWine),
        String(openApplicationsBeerWine),
        String(MAX_BEER_WINE_PER_ZIP - beerWineAvailable),
      ],
    ]
  } else if (licenseType === "All Alcoholic Beverages") {
    rowData = [
      zipcode,
      String(MAX_ALL_ALC_PER_ZIP),
      String(allAlcoholAvailable),
      String(totalApplicantsAllAlc),
      String(openApplicationsAllAlc),
      String(MAX_ALL_ALC_PER_ZIP - allAlcoholAvailable),
    ]
    subRowData = [
      [
        "All Alcohol Licenses",
        String(MAX_ALL_ALC_PER_ZIP),
        String(allAlcoholAvailable),
        String(totalApplicantsAllAlc),
        String(openApplicationsAllAlc),
        String(MAX_ALL_ALC_PER_ZIP - allAlcoholAvailable),
      ]
    ]
  } else if (licenseType === "Wines and Malt Beverages") {
    rowData = [
      zipcode,
      String(MAX_BEER_WINE_PER_ZIP),
      String(beerWineAvailable),
      String(totalApplicantsBeerWine),
      String(openApplicationsBeerWine),
      String(MAX_BEER_WINE_PER_ZIP - beerWineAvailable),
    ]
    subRowData = [
      [
        "Beer & Wine Licenses",
        String(MAX_BEER_WINE_PER_ZIP),
        String(beerWineAvailable),
        String(totalApplicantsBeerWine),
        String(openApplicationsBeerWine),
        String(MAX_BEER_WINE_PER_ZIP - beerWineAvailable),
      ],
    ]
  } else {
    throw new Error("License Type not supported for filtering");
  }

  const tableData = {rowData: rowData, subRowData: subRowData}

  return tableData;
}

const formatData = (
  data: BusinessLicense[],
  zipcodeList: Set<EligibleBostonZipcode>,
  licenseType: "All Alcoholic Beverages" | "Wines and Malt Beverages" | null
) => {
  const zips = [...zipcodeList];
  const grantedData = data.filter((l) => l.status === "Granted");
  const d = zips.map((zipcode) => {

    const { totalAvailable, allAlcoholAvailable, beerWineAvailable } =
      getAvailableLicensesByZipcode(grantedData, zipcode);

    const byZip = data.filter((l) => l.zipcode === zipcode);
    const deferred = byZip.filter((l) => l.status === "Deferred");
    const openApplicationsTotal = deferred.length;
    const openApplicationsAllAlc = deferred.filter((l) => l.alcohol_type === "All Alcoholic Beverages").length;
    const openApplicationsBeerWine = deferred.filter((l) => l.alcohol_type === "Wines and Malt Beverages").length;
    const totalApplicantsTotal = byZip.length;
    const totalApplicantsAllAlc = byZip.filter((l) => l.alcohol_type === "All Alcoholic Beverages").length;
    const totalApplicantsBeerWine = byZip.filter((l) => l.alcohol_type === "Wines and Malt Beverages").length;

    const {rowData, subRowData} = getRowData(zipcode, licenseType, totalAvailable, allAlcoholAvailable, beerWineAvailable, totalApplicantsTotal, totalApplicantsAllAlc, totalApplicantsBeerWine, openApplicationsTotal, openApplicationsAllAlc, openApplicationsBeerWine)

    const entry = {
      rowData: rowData,
      subRowData: subRowData
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
  const [selectedLicDropdownOptions, setSelectedLicDropdownOptions] =
    useState<Selection>(new Set());
  const [licenseFilter, setLicenseFilter] = useState<
    "All Alcoholic Beverages" | "Wines and Malt Beverages" | null
  >(null);

  useEffect(() => {
    const tmp = [];
    for (const license of licenseData) {
      const validated = validateBusinessLicense(license);
      if (validated.valid === true) {
        tmp.push(validated.data);
      }
    }

    setData(tmp);
  }, []);

  const availabilityHeaders = [
    "Zipcode",
    "Total Licenses",
    "Licenses Available",
    "Total Applicants",
    "Open Applications",
    "Licenses Granted",
  ];

  const formattedData = formatData(data, zipcodeList, licenseFilter);

  const onLicenseTypeSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedLicDropdownOptions(new Set(keys as Set<string>));

      const selectedLicenseType = licenseTypeOptions.filter((option) =>
        (keys as Set<string>).has(option.id.toString())
      );

      if (selectedLicenseType.length == 1) {
        setLicenseFilter(selectedLicenseType[0].name)
      } else {
        setLicenseFilter(null)
      }

    },
    []
  );

  if (formattedData == null) {
    return null;
  }

  return (
    <section className={styles.licenseAvailabilityTable}>
      <h4 className={styles.filterDescriptor}>
        <FormattedMessage id="database.availableLicenses.filterBy"/>
      </h4>
      <div className={`${styles.filters} gap-[16px]`}>
        <ZipCodeFilter setZipcodeList={setZipcodeList} />
        <FilterDropdown
          titleId="database.availableLicenses.licenseType"
          label="License Type dropdown selection"
          options={licenseTypeOptions}
          selected={selectedLicDropdownOptions}
          onSelectionChange={onLicenseTypeSelectionChange}
        />
      </div>
      <CustomTable
        ariaLabel="Licenses by Zipcode"
        tableData={formattedData}
        headers={availabilityHeaders}
      />
    </section>
  );
};

export default LicenseAvailabilityTable;
