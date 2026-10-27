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
} from "../../../services/data-interface/data-interface";
import { RowWithSubRows } from "@components/ui/table";
import { useState, useEffect, useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import licenseData from "../../../data/licenses.json";
import {FormattedMessage, IntlShape, useIntl} from "react-intl";
import { isEligibleBostonZipCode } from "../../../services/data-interface/data-interface";
import FilterDropdown, {DropdownOption} from "@/components/ui/filter-dropdown";
import ZipCodeFilter from "./zip-code-filter";
import { Selection, Button, DialogTrigger, ModalOverlay, Modal, Dialog } from "react-aria-components";



const formatData = (
  data: BusinessLicense[],
  zipcodeList: Set<EligibleBostonZipcode>,
  applicationStatusList: Set<ApplicationStatusType>,
  totalApplicantLocalization: string,
  statusLocalizationRecord : Record<string,string>,
  applicationTypeTranslation : Record<string, string>
) => {
  const zips = [...zipcodeList];
  const formattedData = zips.map((zipcode) => {
    let applicants = getApplicantsByZipcode(zipcode, data);
    applicants = getApplicantsByApplicationStatus(applicationStatusList, applicants);
    const subrows = applicants.map((applicant) => {
      let statusLocalization : string
      switch (applicant.status){
        case "Granted":{
          statusLocalization = statusLocalizationRecord[0]
          break;
        }
        case "Expired":{
          statusLocalization = statusLocalizationRecord[1]
          break;
        }
        case "Deferred":{
          statusLocalization = statusLocalizationRecord[2]
          break;
        }
        default:{
          statusLocalization = "error with translation"
        }
      }
      return [
        applicant.business_name,
        applicant.dba_name ?? "None Provided",
        applicant.address,
        applicant.license_number,
        applicationTypeTranslation[applicant.alcohol_type],
        applicant.minutes_date,
        statusLocalization,
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
        `${totalApplicantLocalization} ${applicants.length}`,
      ],
      subRowData: subrows,
    };

    return entry as RowWithSubRows;
  });

  return formattedData;
};

const RecentApplicationTable = () => {
  const intl:IntlShape = useIntl()
  const { zip, section, expand } = useSearch({ from: "/database" });
  const isDeepLinked = section === "recent-applications";
  const initialZip =
    isDeepLinked && zip && isEligibleBostonZipCode(zip) ? zip : undefined;

  const [zipcodeList, setZipcodeList] = useState<Set<EligibleBostonZipcode>>(
    new Set()
  );
  const [data, setData] = useState<BusinessLicense[]>([]);

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
        .getElementById("recent-applications")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Defer until after layout from navigation and filter init
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToSection);
    });

    return () => cancelAnimationFrame(frameId);
  }, [isDeepLinked]);
  const recentApplicationTranslationHeaderId : string[]  = [
      'database.recentApplications.zipCodeBusinessName',
      'database.recentApplications.dba',
      'database.recentApplications.streetAddress',
      'database.recentApplications.licenseNumber',
      'database.recentApplications.licenseType',
      'database.recentApplications.applicationDate',
      'database.recentApplications.applicationStatus'
  ]

  const localizedRecentApplicationHeaders : string[] = recentApplicationTranslationHeaderId.map((id)=>{
    return intl.formatMessage({id, defaultMessage: "error with translation"})
  });

  const tableTitle : string = intl.formatMessage({
    id: "database.recentApplications.title",
    defaultMessage: "error with translation"
  })


  const applicationStatusTranslation = (): Record<string, string> =>{
    const granted = ():string => intl.formatMessage({
      id: "database.recentApplications.granted",
      defaultMessage: "Granted"
    })
    const expired = ():string => intl.formatMessage({
      id: "database.recentApplications.expired",
      defaultMessage: "Expired"
    })
    const deferred = ():string => intl.formatMessage({
      id: "database.recentApplications.deferred",
      defaultMessage: "Deferred"
    })

    return {"granted": granted(), "expired": expired(), "deferred": deferred()}
  }

  const applicationStatusOption = ():DropdownOption[] => {
    return [
      {id: "react-aria-1", name: applicationStatusTranslation()["granted"]},
      {id: "react-aria-2", name: applicationStatusTranslation()["expired"]},
      {id: "react-aria-3", name: applicationStatusTranslation()["deferred"]}
    ]
  }

  const [selectedStatusDropdownOptions, setSelectedStatusDropdownOptions] =
    useState<Selection>(new Set());

  const [statusFilter, setStatusFilter] = useState<Set<ApplicationStatusType>>(new Set());

  
  const onStatusSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedStatusDropdownOptions(new Set(keys as Set<string>));

      const selectedOptions = applicationStatusOption().filter((option) =>
        (keys as Set<string>).has(option.id.toString())
      );
      console.log(selectedOptions)

      const statuses = selectedOptions.map(
        (option) => option.name as ApplicationStatusType
      );

      if (statuses.length) {
        setStatusFilter(new Set(statuses));
      } else {
        setStatusFilter(ApplicationStatusTypes);
      }
    },
    []
  );
  const totalApplicantsLocalization : string = intl.formatMessage(
      {
        id : "database.recentApplications.totalApplicants",
        defaultMessage: "error with translation"
      }
  )
  const statusTranslationId:string[] = [
      "database.recentApplications.granted",
      "database.recentApplications.expired",
      "database.recentApplications.deferred"
  ]

  const statusLocalization: Record<string, string> ={}

  statusTranslationId.map((id,index)=> {
    const translation: string = intl.formatMessage({
      id: id, defaultMessage: "error with translation"
    })
    statusLocalization[index] = translation
  })

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


  const formattedData = formatData(data, zipcodeList, statusFilter, totalApplicantsLocalization, statusLocalization, licenseTypeTranslation());

  const statusStyles: Record<ApplicationStatusType, string> = {
    Granted:
        "bg-license-accepted-green text-font-light rounded-md px-[16px] py-[4px]",
    Expired:
        "bg-license-expired-red text-font-light rounded-md px-[16px] py-[4px]",
    Deferred:
        "bg-license-deferred-yellow text-font-dark rounded-md px-[16px] py-[4px]",
  }

// Cell formatter function - only formats status column in sub-rows
  const statusCellFormatter = (
      cell: string,
      _rowIndex: number,
      cellIndex: number,
      isSubRow: boolean
  ): CellFormat => {
    // Only format the last column (Status - index 6) in sub-rows
    if (isSubRow && cellIndex === 6) {
      let statusClass : string
      switch (cell){
        case applicationStatusTranslation()["granted"]:
          statusClass = "bg-license-accepted-green text-font-light rounded-md px-[16px] py-[4px]"
              break;
        case applicationStatusTranslation()["expired"]:
          statusClass = "bg-license-expired-red text-font-light rounded-md px-[16px] py-[4px]"
              break;
        case applicationStatusTranslation()["deferred"]:
            statusClass = "bg-license-deferred-yellow text-font-dark rounded-md px-[16px] py-[4px]"
              break;
        default:
          statusClass = ""
      }
      return {
        content: cell,
        className: statusClass,
      };
    }

    // Return cell unchanged for all other cases
    return { content: cell };
  };

  if (formattedData == null) {
    return null;
  }

  return (
    <section
      id="recent-applications"
      className={tableStyles.licenseAvailabilityTable}
    >
        <h2>
          <FormattedMessage id="database.recentApplications.title" />
        </h2>
        <div className={`${tableStyles.filters} gap-[16px]`}>
          <ZipCodeFilter
            setZipcodeList={setZipcodeList}
            initialZip={initialZip}
          />
          <FilterDropdown
            titleId="database.recentApplications.applicationStatus"
            label="Application Status dropdown selection"
            options={applicationStatusOption()}
            selected={selectedStatusDropdownOptions}
            onSelectionChange={onStatusSelectionChange}
          />
          <div className={tableStyles.legendContainer}>
            <DialogTrigger>
              <Button 
                className={`${tableStyles.tableLegend} gap-[10px] bg-ui-gray px-[16px] py-[8px] rounded-[8px]`}
              >
                <div><FormattedMessage id="database.recentApplications.tableLegend"/></div>
                <div className={`${tableStyles.infoIcon} w-[24px] h-[24px]`}></div>
              </Button>
              <ModalOverlay isDismissable className={tableStyles.modalOverlay}>
              <Modal className={tableStyles.tableLegendModal}>
                <Dialog aria-labelledby="legend-header">
                  {({ close }) => (
                    <>
                    <div className={tableStyles.legendHeader}>
                      <h2 id="legend-header">Recent Application Legend</h2>
                      <Button onPress={close} className={tableStyles.legendCloseButton}>✕</Button>
                    </div>
                    <ul className={tableStyles.legendList}>
                      {[...ApplicationStatusTypes].map((appStatus) => (
                        <li key={appStatus} className={tableStyles.legendItem}>
                          <div className={`${statusStyles[appStatus]} ${tableStyles.legendItemBadge}`}>{appStatus}</div>
                          <p className={tableStyles.legendItemDescription}>
                            <FormattedMessage id={`database.recentApplications.${appStatus.toLowerCase()}.description`}/>
                          </p>
                        </li>
                      ))
                      }
                    </ul>
                    </>
                  )}
                </Dialog>
              </Modal>
              </ModalOverlay>
            </DialogTrigger>
          </div>
        </div>
      <CustomTable
        ariaLabel={tableTitle}
        tableData={formattedData}
        headers={localizedRecentApplicationHeaders}
        cellFormatter={statusCellFormatter}
        defaultSubRowsExpanded={isDeepLinked && expand}
      />
    </section>
  );
};

export default RecentApplicationTable;
