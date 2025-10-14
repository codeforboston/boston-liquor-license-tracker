import "./license-type.module.css";
import { FormattedMessage } from "react-intl";

const LicenseType = () => {
  return (
    <section className="license-type py-[32px] px-[64px] bg-light">
      <h2 className="font-bold text-[36px] m-0">
        <FormattedMessage id="database.licenseType.header2" />
      </h2>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseType.header2-paragraph" />
      </p>
      <h3 className="font-medium text-[32px]">
        <FormattedMessage id="database.licenseType.transferable-header2" />
      </h3>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseType.transferable-paragraph" />
      </p>
      <h3 className="font-medium text-[32px]">
        <FormattedMessage id="database.licenseType.nonTransferable-header3" />
      </h3>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseType.nonTransferable-paragraph" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database.licenseType.law-header4" />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseType.law-paragraph" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database.licenseType.specialAreas-header4" />
      </h4>
      <p className="mt-[8px] font-normal text-[16px]">
        <FormattedMessage id="database.licenseType.specialAreas-paragraph" />
      </p>
    </section>
  );
};

export default LicenseType;
