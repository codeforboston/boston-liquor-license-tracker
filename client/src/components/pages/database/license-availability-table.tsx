import styles from "./license-availability-table.module.css";
import licenseData from "../../../data/licenses.json";
import CustomTable from "@components/ui/table";
import { useState, useEffect, useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import {
  validateBusinessLicense,
  getAvailableLicensesByZipcode,
  BusinessLicense,
  EligibleBostonZipcode,
  isEligibleBostonZipCode,
} from "@/services/data-interface/data-interface";
import {
  MAX_ALL_ALC_PER_ZIP,
  MAX_AVAILABLE_PER_ZIP,
  MAX_BEER_WINE_PER_ZIP,
} from "@/services/data-interface/data-interface";
import { RowWithSubRows } from "@components/ui/table";
import FilterDropdown, {DropdownOption} from "../../ui/filter-dropdown";
import ZipCodeFilter from "./zip-code-filter";
import { Selection } from "react-aria-components";
import {FormattedMessage, useIntl} from "react-intl";

const getRowData = (
  zipcode: EligibleBostonZipcode,
  licenseType: "All Alcoholic Beverages" | "Wines and Malt Beverages" | null,
  translatedLicenseType: Record<string,string>,
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
        translatedLicenseType["All Alcoholic Beverages"],
        String(MAX_ALL_ALC_PER_ZIP),
        String(allAlcoholAvailable),
        String(totalApplicantsAllAlc),
        String(openApplicationsAllAlc),
        String(MAX_ALL_ALC_PER_ZIP - allAlcoholAvailable),
      ],
      [
        translatedLicenseType["Wines and Malt Beverages"],
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
        translatedLicenseType["All Alcoholic Beverages"],
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
        translatedLicenseType["Wines and Malt Beverages"],
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

  return {rowData: rowData, subRowData: subRowData}
}

const formatData = (
  data: BusinessLicense[],
  zipcodeList: Set<EligibleBostonZipcode>,
  licenseType: "All Alcoholic Beverages" | "Wines and Malt Beverages" | null,
  translatedLicenseType: Record<string,string>
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

    const {rowData, subRowData} = getRowData(zipcode, licenseType,translatedLicenseType, totalAvailable, allAlcoholAvailable, beerWineAvailable, totalApplicantsTotal, totalApplicantsAllAlc, totalApplicantsBeerWine, openApplicationsTotal, openApplicationsAllAlc, openApplicationsBeerWine)

    const entry = {
      rowData: rowData,
      subRowData: subRowData
    };

    return entry as RowWithSubRows;
  });

  return d;
};



const LicenseAvailabilityTable = () => {
  const intl = useIntl()
  const { zip, section, expand } = useSearch({ from: "/database" });
  const isDeepLinked = section === "license-availability";
  const initialZip =
    isDeepLinked && zip && isEligibleBostonZipCode(zip) ? zip : undefined;

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
      if (validated.valid) {
        tmp.push(validated.data);
      }
    }

    setData(tmp);
  }, []);

  useEffect(() => {
    if (!isDeepLinked) return;

    const scrollToSection = () => {
      document
        .getElementById("license-availability")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToSection);
    });

    return () => cancelAnimationFrame(frameId);
  }, [isDeepLinked]);

  const licenseTypeTranslation = () : Record<string,string> =>{
    const alcoholicBev = ():string => intl.formatMessage({
      id: "database.recentApplications.allAlcohol",
      defaultMessage: "All Alcohol"
    })

    const wineAndBeer = ():string => intl.formatMessage({
      id: "database.recentApplications.wineAndBeer",
      defaultMessage: "Wine & Beer"
    })

    return {"All Alcoholic Beverages":alcoholicBev(),"Wines and Malt Beverages":wineAndBeer()}
  }

  const licenseTypeOptions = ():DropdownOption[] =>{
    return  [
      { id: "react-aria-1", name: licenseTypeTranslation()["All Alcoholic Beverages"]},
      { id: "react-aria-2", name: licenseTypeTranslation()["Wines and Malt Beverages"]},
    ]
  }

  const translationHeaderId: string[]=[
      'database.availableLicenses.zipCode',
      'database.availableLicenses.totalLicenses',
      'database.availableLicenses.licensesAvailable',
      'database.recentApplications.totalApplicants',
      'database.availableLicenses.openApplicants',
      'database.availableLicenses.licensesGranted',
  ]
  const localizedAvailabilityHeader : string[] = translationHeaderId.map((id)=>{
    return intl.formatMessage({id,defaultMessage:"error translating"})
  });


  const formattedData = formatData(data, zipcodeList, licenseFilter, licenseTypeTranslation() );

  const onLicenseTypeSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedLicDropdownOptions(new Set(keys as Set<string>));

      const selectedLicenseType = licenseTypeOptions().filter((option) => {
        return (keys as Set<string>).has(option.id.toString())
          }
      );

      if (selectedLicenseType.length == 1) {
        switch (selectedLicenseType[0].id) {
          case "react-aria-1":
            setLicenseFilter("All Alcoholic Beverages")
                break;
          case "react-aria-2":
            setLicenseFilter("Wines and Malt Beverages")
                break;
        }
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
    <section
      id="license-availability"
      className={styles.licenseAvailabilityTable}
    >
      <h4 className={styles.filterDescriptor}>
        <FormattedMessage id="database.availableLicenses.filterBy"/>
      </h4>
      <div className={`${styles.filters} gap-[16px]`}>
        <ZipCodeFilter
          setZipcodeList={setZipcodeList}
          initialZip={initialZip}
        />
        <FilterDropdown
          titleId="database.availableLicenses.licenseType"
          label="License Type dropdown selection"
          options={licenseTypeOptions()}
          selected={selectedLicDropdownOptions}
          onSelectionChange={onLicenseTypeSelectionChange}
        />
      </div>
      <CustomTable
        ariaLabel="Licenses by Zipcode"
        tableData={formattedData}
        headers={localizedAvailabilityHeader}
        defaultSubRowsExpanded={isDeepLinked && expand}
      />
    </section>
  );
};

export default LicenseAvailabilityTable;
