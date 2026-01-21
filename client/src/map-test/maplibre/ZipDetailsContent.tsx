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
import { FormattedMessage } from "react-intl";
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
    applications: numOfApplicants,
  };

  console.log("calculated data", data);

  return data;
};

export const ZipDetailsContent = ({ licenses, zipCode }: ZipDetailsProps) => {
  if (!zipCode || !licenses) {
    return <ZipDetailsError />;
  }

  if (!isEligibleBostonZipCode(zipCode)) {
    return <ZipDetailsEmpty zipCode={zipCode} />;
  }

  const zipcodeLicenseData = getZipCodeLicenseData(licenses, zipCode);
  console.log({ zipcodeLicenseData });

  const tabs = [
    { id: "allLicenses", label: "All Licenses", content: <>All Licenses</> },
    { id: "beerAndWine", label: "Beer & Wine", content: <>Beer and Wine</> },
    { id: "allAlcohol", label: "All Alcohol", content: <>All alcohol</> },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <ZipCodeDetailsHeader zipCode={zipCode} showSubtitle />
      <p className="my-[16px]">
        <FormattedMessage id="map.zipDetails.description" />
      </p>

      <div className="flex items-center">
        <div>Beer & Wine</div>
        <div>All Alcohol</div>
        <div>All Licenses</div>
      </div>

      <Tabs tabs={tabs} defaultTab="allLicenses" />
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
      <Button onClick={() => window.location.reload()}>Refresh Page</Button>
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
