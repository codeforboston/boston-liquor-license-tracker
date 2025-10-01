import "./license-type.module.css";
import { FormattedMessage } from "react-intl";

const LicenseType = () => {
  return (
    <section className="license-type py-[32px] px-[64px] bg-background-light">
      <h2 className="font-bold text-[36px] m-0">
        <FormattedMessage id="database.licenseTerminology.header" />
      </h2>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseTerminology.description" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database.licenseTerminology.allAlcohol.title" />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseTerminology.allAlcohol.description" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database.licenseTerminology.wineAndBeer.title" />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseTerminology.wineAndBeer.description" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database.licenseTerminology.transferable.title" />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseTerminology.transferable.description" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database.licenseTerminology.nonTransferable.title" />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseTerminology.nonTransferable.description" />
      </p>
    </section>
  );
};

export default LicenseType;
