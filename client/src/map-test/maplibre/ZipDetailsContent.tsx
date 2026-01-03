import { Button } from "@/components/ui/button";
import getNumOfLicenses, {
  BusinessLicense,
  EligibleBostonZipcode,
  getAvailableLicensesByZipcode,
  isEligibleBostonZipCode,
} from "@/services/data-interface/data-interface";
import dataError from "../../assets/icons/data-error.svg";
import clipboards from "../../assets/icons/clipboards-question-mark.svg";
import { FormattedMessage } from "react-intl";

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
  const filteredByZip = licenses.filter(
    (license) => license.zipcode === zipCode
  );
  const { totalAvailable, allAlcoholAvailable, beerWineAvailable } =
    getAvailableLicensesByZipcode(filteredByZip, zipCode);
  const licensesGranted = filteredByZip.filter(
    (license) => license.zipcode === zipCode && license.status === "Granted"
  ).length;
  const totalLicenses = 0;

  const numLicenses = getNumOfLicenses(licenses, { filterByZipcode: zipCode });

  filteredByZip.forEach((license) => console.log(license.zipcode));

  console.log({
    totalAvailable,
    allAlcoholAvailable,
    beerWineAvailable,
    licensesGranted,
    totalLicenses,
    numLicenses,
  });
  return {
    [LicenseFilterValue.AllLicenses]: getAvailableLicensesByZipcode(
      licenses,
      zipCode
    ),
    // [LicenseFilterValue.AllAlcohol]
  };
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

  return (
    <div className="flex flex-col h-full w-full font-medium text-[18px]">
      <ZipCodeDetailsHeader zipCode={zipCode} showSubtitle />
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
    <h2 className="text-2xl font-bold mb-[8px]">{zipCode}</h2>
    {showSubtitle && (
      <div>
        <FormattedMessage id="map.zipDetails.subtitle" />
      </div>
    )}
    <hr />
  </>
);
