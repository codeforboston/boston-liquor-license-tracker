import tableStyles from "./recent-application-table.module.css";
import CustomTable, { CellFormat } from "@components/ui/table";
import {
  BusinessLicense,
  EligibleBostonZipcode,
  getApplicantsByZipcode,
  ApplicationStatusType,
  ApplicationStatusTypes,
  validateBusinessLicense,
  getApplicantsByApplicationStatus,
  getApplicantPage,
} from "../../../services/data-interface/data-interface";
import { RowWithSubRows } from "@components/ui/table";
import { useState, useEffect, useMemo, useCallback } from "react";
import licenseData from "../../../data/licenses.json";
import { FormattedMessage } from "react-intl";
import FilterDropdown from "@/components/ui/filter-dropdown";
import ZipCodeFilter from "./zip-code-filter";
import { Selection } from "react-aria-components";
import DotPagination from "@/components/ui/dot-pagination";

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
  zipcodeList: Set<EligibleBostonZipcode>,
  applicationStatusList: Set<ApplicationStatusType>,
  pageIndex: number
) => {
  const zips = [...zipcodeList];
  const formattedData = zips.map((zipcode) => {
    let applicants = getApplicantPage(pageIndex, data);
    applicants = getApplicantsByZipcode(zipcode, applicants);
    applicants = getApplicantsByApplicationStatus(applicationStatusList, applicants);
    const subrows = applicants.map((applicant) => {
      return [
        applicant.business_name,
        applicant.dba_name ?? "None Provided",
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
  const [zipcodeList, setZipcodeList] = useState<Set<EligibleBostonZipcode>>(
    new Set()
  );
  const [data, setData] = useState<BusinessLicense[]>([]);

  const [pageIndex, setPageIndex] = useState<number>(1);

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
    "Doing Business As",
    "Street Address",
    "License Number",
    "Licenses Type",
    "Application Date",
    "Status",
  ];

  const dropdownStatusOptions = useMemo(
    () =>
      [...ApplicationStatusTypes].map((status, index) => ({
        id: `react-aria-${index + 1}`,
        name: String(status),
      })),
    []
  );
  const [selectedStatusDropdownOptions, setSelectedStatusDropdownOptions] =
    useState<Selection>(new Set());

  const [statusFilter, setStatusFilter] = useState<Set<ApplicationStatusType>>(new Set());

  
  const onStatusSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedStatusDropdownOptions(new Set(keys as Set<string>));

      const selectedOptions = dropdownStatusOptions.filter((option) =>
        (keys as Set<string>).has(option.id.toString())
      );

      const statuses = selectedOptions.map(
        (option) => option.name as ApplicationStatusType
      );

      if (statuses.length) {
        setStatusFilter(new Set(statuses));
      } else {
        setStatusFilter(ApplicationStatusTypes);
      }
    },
    [dropdownStatusOptions]
  );

  const pageCount = Math.ceil(data.length / 20);

  const formattedData = formatData(data, zipcodeList, statusFilter, pageIndex);

  if (formattedData == null) {
    return null;
  }

  return (
    <section className={tableStyles.licenseAvailabilityTable}>
        <h2>
          <FormattedMessage id="database.licenseAvailabilityTable.header" />
        </h2>
        <div className={`${tableStyles.filters} gap-[16px]`}>
          <ZipCodeFilter setZipcodeList={setZipcodeList} />
          <FilterDropdown
            titleId="database.filter.applicationStatus"
            label="Application Status dropdown selection"
            options={dropdownStatusOptions}
            selected={selectedStatusDropdownOptions}
            onSelectionChange={onStatusSelectionChange}
          />
          <div className={tableStyles.legendContainer}>
            <div className={`${tableStyles.tableLegend} gap-[10px] bg-ui-gray px-[16px] py-[8px] rounded-[8px]`}>
              <div><FormattedMessage id="database.licenseAvailabilityTable.legend"/></div>
              <div className={`${tableStyles.infoIcon} w-[24px] h-[24px]`}></div>
            </div>
          </div>
        </div>
      <CustomTable
        ariaLabel="Recent License Applications by Zipcode"
        tableData={formattedData}
        headers={recentApplicationHeaders}
        cellFormatter={statusCellFormatter}
      />
        
        <div className={tableStyles.pagination}>
          <DotPagination
            currentPage={pageIndex - 1}
            totalPages={pageCount}
            onPageChange={(newPage) => setPageIndex(newPage + 1)}
            pageButtonStyling={"h-[32px] w-[32px] rounded-[4px]"}
          />
        </div>
    </section>
  );
};

export default RecentApplicationTable;
