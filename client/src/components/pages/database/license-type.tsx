import "./license-type.module.css";
import { FormattedMessage } from "react-intl";

const LicenseType = () => {
  return (
    <section className="license-type py-[32px] px-[64px] bg-light">
      <h2 className="font-bold text-[36px] m-0">
        <FormattedMessage id="database.license-type.header2" />
      </h2>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.license-type.header2-paragraph" />
      </p>
      <h3 className="font-medium text-[32px]">
        <FormattedMessage id="database.license-type.transferable-header2" />
      </h3>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.license-type.transferable-paragraph" />
      </p>
      <h3 className="font-medium text-[32px]">
        <FormattedMessage id="database.license-type.nonTransferable-header3" />
      </h3>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.license-type.nonTransferable-paragraph" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database.license-type.law-header4" />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database.license-type.law-paragraph" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database.license-type.specialAreas-header4" />
      </h4>
      <p className="mt-[8px] font-normal text-[16px]">
        <FormattedMessage id="database.license-type.specialAreas-paragraph" />
      </p>
    </section>
  );
};

export default LicenseType;
