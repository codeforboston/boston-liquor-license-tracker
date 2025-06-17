import "./license-type.module.css";
import { FormattedMessage } from "react-intl";

const LicenseType = () => {
  return (
    <section className="license-type p-[32px] bg-[#FDFDFD]">
      <h2 className="font-bold text-[36px] m-0">
        <FormattedMessage id="database-page.license-type.header2" />
      </h2>
      <p className="mt-[8px] mb-[32px] font-normal text-[16px]">
        <FormattedMessage id="database-page.license-type.header2-paragraph" />
      </p>
      <h3 className="font-medium text-[32px]">
        <FormattedMessage id="database-page.license-type.transferable-header2" />
      </h3>
      <p className="mt-[8px] mb-[32px] font-normal text-[16px]">
        <FormattedMessage id="database-page.license-type.transferable-paragraph" />
      </p>
      <h3 className="font-medium text-[32px]">
        <FormattedMessage id="database-page.license-type.nonTransferable-header3" />
      </h3>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database-page.license-type.nonTransferable-paragraph" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database-page.license-type.law-header4" />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage id="database-page.license-type.law-paragraph" />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage id="database-page.license-type.specialAreas-header4" />
      </h4>
      <p className="mt-[8px] font-normal text-[16px]">
        <FormattedMessage id="database-page.license-type.specialAreas-paragraph" />
      </p>
    </section>
  );
};

export default LicenseType;
