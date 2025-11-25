import tableStyles from "./recent-application-table.module.css";
import CustomTable, { CellFormat } from "@components/ui/table";
import {
  BusinessLicense,
  EligibleBostonZipcode,
  eligibleBostonZipcodes,
  getApplicantsByZipcode,
  validateBusinessLicense,
} from "../../../services/data-interface/data-interface";
import { RowWithSubRows } from "@components/ui/table";
import { useState, useEffect } from "react";
import licenseData from "../../../data/licenses.json";

// Cell formatter function - only formats status column in sub-rows
const statusCellFormatter = (
  cell: string,
  _rowIndex: number,
  cellIndex: number,
  isSubRow: boolean
): CellFormat => {
  // Only format the last column (Status - index 6) in sub-rows
  if (isSubRow && cellIndex === 6) {
    const statusStyles: Record<string, string> = {
      Granted:
        "bg-license-accepted-green text-font-light rounded-md px-[16px] py-[4px]",
      Expired:
        "bg-license-expired-red text-font-light rounded-md px-[16px] py-[4px]",
      Deferred:
        "bg-license-deferred-yellow text-font-dark rounded-md px-[16px] py-[4px]",
    };

    return {
      content: cell,
      className: statusStyles[cell] || "",
    };
  }

  // Return cell unchanged for all other cases
  return { content: cell };
};

const formatData = (
  data: BusinessLicense[],
  zipcodeList: Set<EligibleBostonZipcode>
) => {
  const zips = [...zipcodeList];
  const formattedData = zips.map((zipcode) => {
    const applicants = getApplicantsByZipcode(zipcode, data);
    const subrows = applicants.map((applicant) => {
      return [
        applicant.business_name,
        applicant.dba_name ?? "N/A",
        applicant.address,
        applicant.license_number,
        applicant.alcohol_type,
        applicant.minutes_date,
        applicant.status,
      ];
    });
    const entry = {
      rowData: [
        `${zipcode}`,
        "_",
        "_",
        "_",
        "_",
        "_",
        `Total Applicants: ${applicants.length}`,
      ],
      subRowData: subrows,
    };

    return entry as RowWithSubRows;
  });

  return formattedData;
};

const RecentApplicationTable = () => {
  const [data, setData] = useState<BusinessLicense[]>([]);

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
  const recentApplicationHeaders = [
    "Zipcode/Business Name",
    "Dba",
    "Street Address",
    "License Number",
    "Licenses Type",
    "App. Date",
    "Status",
  ];

  const formattedData = formatData(data, eligibleBostonZipcodes);

  if (formattedData == null) {
    return null;
  }

  return (
    <section className={tableStyles.licenseAvailabilityTable}>
      <CustomTable
        ariaLabel="Recent License Applications by Zipcode"
        tableData={formattedData}
        headers={recentApplicationHeaders}
        cellFormatter={statusCellFormatter}
      />
    </section>
  );
};

export default RecentApplicationTable;
