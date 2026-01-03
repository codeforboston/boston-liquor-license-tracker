import { Button } from "@/components/ui/button";
import {
  BusinessLicense,
  EligibleBostonZipcode,
  getApplicantsByZipcode,
  getAvailableLicensesByZipcode,
  isEligibleBostonZipCode,
} from "@/services/data-interface/data-interface";
import dataError from "../../assets/icons/data-error.svg";
import clipboards from "../../assets/icons/clipboards-question-mark.svg";
import { FormattedMessage, useIntl } from "react-intl";
import Tabs from "@/components/ui/tabs";

type ZipDetailsProps = {
  zipCode?: string;
  licenses?: BusinessLicense[];
};

const LicenseFilterValue = {
  AllLicenses: "All Licenses",
  AllAlcohol: "All Alcoholic Beverages",
  BeerAndWine: "Wines and Malt Beverages",
} as const;

// filters: all licenses, beer and wine, all alcohol
// each has: licenses available, licenses granted, total licenses
const getZipCodeLicenseData = (
  licenses: BusinessLicense[],
  zipCode: EligibleBostonZipcode
) => {
  // Licenses
  const filteredByZip = licenses.filter(
    (license) => license.zipcode === zipCode
  );
  const grantedLicenses = filteredByZip.filter(
    (license) => license.zipcode === zipCode && license.status === "Granted"
  );

  const numOfApplicants = getApplicantsByZipcode(zipCode, licenses);

  // Available licenses from granted
  const available = getAvailableLicensesByZipcode(grantedLicenses, zipCode);

  // Granted licenses
  const numLicensesGrantedBeerAndWine = grantedLicenses.filter(
    (license) => license.alcohol_type === LicenseFilterValue.BeerAndWine
  ).length;
  const numLicensesGrantedAllAlcohol = grantedLicenses.filter(
    (license) => license.alcohol_type === LicenseFilterValue.AllAlcohol
  ).length;

  const data = {
    [LicenseFilterValue.AllLicenses]: {
      available: available.totalAvailable,
      granted: grantedLicenses.length,
      total: available.totalAvailable + grantedLicenses.length,
    },
    [LicenseFilterValue.AllAlcohol]: {
      available: available.allAlcoholAvailable,
      granted: numLicensesGrantedAllAlcohol,
      total: available.allAlcoholAvailable + numLicensesGrantedAllAlcohol,
    },
    [LicenseFilterValue.BeerAndWine]: {
      available: available.beerWineAvailable,
      granted: numLicensesGrantedBeerAndWine,
      total: available.beerWineAvailable + numLicensesGrantedBeerAndWine,
    },
    applicants: numOfApplicants,
  };

  return data;
};

type ZipDetailsTabContentProps = {
  licensesAvailable: number;
  licensesGranted: number;
  totalLicenses: number;
};

const ZipDetailsTabContent = ({
  licensesAvailable,
  licensesGranted,
  totalLicenses,
}: ZipDetailsTabContentProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center bg-[var(--color-ui-gray)] border border-[var(--color-border-gray)] rounded-t p-2">
        <span className="text-left">
          <FormattedMessage id="map.zipDetails.licensesAvailable" />
        </span>
        <span className="text-right">{licensesAvailable}</span>
      </div>
      <div className="flex justify-between items-center bg-white border-x border-b border-[var(--color-border-gray)] p-2">
        <span className="text-left">
          <FormattedMessage id="map.zipDetails.licensesGranted" />
        </span>
        <span className="text-right">{licensesGranted}</span>
      </div>
      <div className="flex justify-between items-center bg-[var(--color-ui-gray)] border-x border-b border-[var(--color-border-gray)] rounded-b p-2">
        <span className="text-left">
          <FormattedMessage id="map.zipDetails.totalLicenses" />
        </span>
        <span className="text-right">{totalLicenses}</span>
      </div>
    </div>
  );
};

export const ZipDetailsContent = ({ licenses, zipCode }: ZipDetailsProps) => {
  const intl = useIntl();

  if (!zipCode || !licenses) {
    return <ZipDetailsError />;
  }

  if (!isEligibleBostonZipCode(zipCode)) {
    return <ZipDetailsEmpty zipCode={zipCode} />;
  }

  const zipcodeLicenseData = getZipCodeLicenseData(licenses, zipCode);

  const allLicensesData = zipcodeLicenseData[LicenseFilterValue.AllLicenses];
  const beerAndWineData = zipcodeLicenseData[LicenseFilterValue.BeerAndWine];
  const allAlcoholData = zipcodeLicenseData[LicenseFilterValue.AllAlcohol];

  const tabs = [
    {
      id: "allLicenses",
      label: intl.formatMessage({ id: "map.zipDetails.tabAllLicenses" }),
      content: (
        <ZipDetailsTabContent
          licensesAvailable={allLicensesData.available}
          licensesGranted={allLicensesData.granted}
          totalLicenses={allLicensesData.total}
        />
      ),
    },
    {
      id: "beerAndWine",
      label: intl.formatMessage({ id: "map.zipDetails.tabBeerAndWine" }),
      content: (
        <ZipDetailsTabContent
          licensesAvailable={beerAndWineData.available}
          licensesGranted={beerAndWineData.granted}
          totalLicenses={beerAndWineData.total}
        />
      ),
    },
    {
      id: "allAlcohol",
      label: intl.formatMessage({ id: "map.zipDetails.tabAllAlcohol" }),
      content: (
        <ZipDetailsTabContent
          licensesAvailable={allAlcoholData.available}
          licensesGranted={allAlcoholData.granted}
          totalLicenses={allAlcoholData.total}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <ZipCodeDetailsHeader zipCode={zipCode} showSubtitle />
      <p className="mt-4">
        <FormattedMessage id="map.zipDetails.description" />
      </p>

      <h3 className="my-4">
        <FormattedMessage id="map.zipDetails.zipCodeLicenseInfo" />
      </h3>
      <Tabs tabs={tabs} defaultTab="allLicenses" />
      {/* TODO: Link to the appropriate section */}
      <a
        className="underline text-right m-2"
        href="/boston-liquor-license-tracker/#/database"
      >
        <FormattedMessage id="map.zipDetails.detailedView" />
      </a>

      <h3 className="my-4">
        <FormattedMessage id="map.zipDetails.applicationsInZipCode" />
      </h3>
      <div className="flex bg-(--color-background-dark) rounded-sm rounded-t justify-between mb-2">
        <span className="text-[var(--color-font-light)] p-2">
          <FormattedMessage id="map.zipDetails.recentApplicants" />
        </span>
        <span className="bg-(--color-background-light) py-2 px-4 border border-[var(--color-border-gray)] rounded-sm">
          {zipcodeLicenseData.applicants.length}
        </span>
      </div>
      {/* TODO: Link to the appropriate section */}
      <a
        className="underline text-right m-2"
        href="/boston-liquor-license-tracker/#/database"
      >
        <FormattedMessage id="map.zipDetails.seeAllApplications" />
      </a>
    </div>
  );
};

export const ZipDetailsError = () => {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center text-center gap-[32px]">
      <img className="w-[90px] justify-self-center" src={dataError} />
      <h3 className="font-medium text-[18px] px-[10px]">
        <FormattedMessage id="map.error.message" />
      </h3>
      <Button onClick={() => window.location.reload()}>
        <FormattedMessage id="map.error.refreshPage" />
      </Button>
    </div>
  );
};

export const ZipDetailsEmpty = ({ zipCode }: ZipDetailsProps) => {
  return (
    <div className="flex flex-col h-full w-full font-medium text-[18px]">
      <ZipCodeDetailsHeader zipCode={zipCode} />
      <div className="items-center text-center h-[stretch] content-center px-[32px]">
        <h3>
          <FormattedMessage id="map.empty.noData" />
        </h3>
        <img
          className="w-[90px] justify-self-center m-[32px]"
          src={clipboards}
        />
        <h3 className="mb-[32px]">
          <FormattedMessage id="map.empty.tryLater" />
        </h3>
      </div>
    </div>
  );
};

const ZipCodeDetailsHeader = ({
  zipCode,
  showSubtitle = false,
}: ZipDetailsProps & { showSubtitle?: boolean }) => (
  <>
    <div className="flex mb-[8px]">
      <h2 className="text-2xl font-bold w-fit">{zipCode}</h2>
      {showSubtitle && (
        <p className="text-sm content-end italic font-normal ml-[8px]">
          <FormattedMessage id="map.zipDetails.subtitle" />
        </p>
      )}
    </div>
    <hr className="border-t-2" />
  </>
);
