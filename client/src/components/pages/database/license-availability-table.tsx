import styles from "./license-availability-table.module.css"
import licenseData from '../../../data/licenses.json';
import { eligibleBostonZipcodes } from '@/services/data-interface/data-interface';
import CustomTable from "@components/ui/table";
import {useState, useEffect} from 'react';
import { validateBusinessLicense, getAvailableLicensesByZipcode, BusinessLicense, EligibleBostonZipcode } from '@/services/data-interface/data-interface';
import { MAX_ALL_ALC_PER_ZIP, MAX_AVAILABLE_PER_ZIP, MAX_BEER_WINE_PER_ZIP } from '@/services/data-interface/data-interface';
import { RowWithSubRows } from '@components/ui/table';
import FilterDropdown from "../../ui/filter-dropdown";

const formatData = (data: BusinessLicense[], zipcodeList: Set<EligibleBostonZipcode>) => {
    const zips = [...zipcodeList]
    const d = zips.map((zipcode) => {
    const {totalAvailable, allAlcoholAvailable, beerWineAvailable} = getAvailableLicensesByZipcode(data, zipcode); 
    const entry = {
        rowData: [zipcode, String(totalAvailable), '-', String(MAX_AVAILABLE_PER_ZIP - totalAvailable), String(MAX_AVAILABLE_PER_ZIP)],
        subRowData: [
            ['All Alcohol Licenses', String(allAlcoholAvailable), '-', String(MAX_ALL_ALC_PER_ZIP - allAlcoholAvailable), String(MAX_ALL_ALC_PER_ZIP)],
            ['Beer & Wine Licenses', String(beerWineAvailable), '-', String(MAX_BEER_WINE_PER_ZIP - beerWineAvailable), String(MAX_BEER_WINE_PER_ZIP)],
        ] 
    }

    return entry as RowWithSubRows;

    })

    return d;
  }

const LicenseAvailabilityTable = () => {
    const [data, setData] = useState<BusinessLicense[]>([]);
    const [zipcodeList, setZipcodeList] = useState<Set<EligibleBostonZipcode>>(new Set());

    useEffect(() => {
      const tmp = []
      for (const license of licenseData) {
        const validated = validateBusinessLicense(license);
        if (validated.valid === true && license.status === "Granted") {
            tmp.push(validated.data);
        }
      }

      setData(tmp);
      setZipcodeList(eligibleBostonZipcodes)

    }, [])

  const availabilityHeaders = [
    'Zipcode',
    'Licenses Available', 
    'Recent Applicants',
    'Licenses Granted',
    'Total Licenses'
  ]

  const formattedData = formatData(data, zipcodeList);

  const dropdownZipArray = [...eligibleBostonZipcodes].map((zip, index) => {
    return {id: `react-aria-${index + 1}`, name: String(zip)}
  });

 if (formattedData == null) {
     return null
 }

  return (
    <section className={styles.licenseAvailabilityTable}>
      <FilterDropdown title="Zipcode" label="Zipcode dropdown selection" options={dropdownZipArray} setZipcodeList={setZipcodeList} />
      <CustomTable ariaLabel="Licenses by Zipcode" tableData={formattedData} headers={availabilityHeaders}/>
    </section>
  )
}

export default LicenseAvailabilityTable;
