import "./license-type.css";
import { FormattedMessage } from "react-intl";

const LicenseType = () => {
  return (
    <section className="license-type p-[32px] bg-[#FDFDFD]">
      <h2 className="font-bold text-[36px] m-0">
        <FormattedMessage
          id="database-page.license-type.header2"
          defaultMessage="What does each type of license mean?"
        />
      </h2>
      <p className="mt-[8px] mb-[32px] font-normal text-[16px]">
        <FormattedMessage
          id="database-page.license-type.header2-paragraph"
          defaultMessage="Boston has several different types of licenses from a variety of different laws and statutes, which can lead to some confusion when applying for a license. These licenses can range from those that apply city-wide to licenses for specific areas of Boston. Below are some basic definitions of each license type to aid you in your search."
        />
      </p>
      <h3 className="font-medium text-[32px]">
        <FormattedMessage
          id="database-page.license-type.transferable-header2"
          defaultMessage="Transferable Licenses"
        />
      </h3>
      <p className="mt-[8px] mb-[32px] font-normal text-[16px]">
        <FormattedMessage
          id="database-page.license-type.transferable-paragraph"
          defaultMessage="Licenses that have no restrictions preventing them from being transferred to another business and/or another part of the city of Boston. Most of the licenses in Boston are of this type, and all licenses issued before 2006 fall under this category."
        />
      </p>
      <h3 className="font-medium text-[32px]">
        <FormattedMessage
          id="database-page.license-type.nonTransferable-header3"
          defaultMessage="Non-Transferable Licenses"
        />
      </h3>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage
          id="database-page.license-type.nonTransferable-paragraph"
          defaultMessage="Restrictions are placed on certain licenses, preventing them from being transferred outside of their legally designated area of Boston. These licenses can come in several different forms, most notably the licenses created under the 2024 law designating licenses to several zip codes."
        />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage
          id="database-page.license-type.law-header4"
          defaultMessage="New 2024 Law"
        />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16px]">
        <FormattedMessage
          id="database-page.license-type.law-paragraph"
          defaultMessage="In 2024, the city of Boston passed a new law to increase access to liquor licenses in several parts of Boston. Through this law, the city will issue 5 new on-premise liquor licenses to 13 of Boston's zip codes each year for the next 3 years."
        />
      </p>
      <h4 className="font-medium text-[24px]">
        <FormattedMessage
          id="database-page.license-type.specialAreas-header4"
          defaultMessage="Special Areas of Boston"
        />
      </h4>
      <p className="mt-[8px] font-normal text-[16px]">
        <FormattedMessage
          id="database-page.license-type.specialAreas-paragraph"
          defaultMessage="Another provision of the 2024 law was the creation of specialty licenses for Oak Square in Brighton. Several other laws in the past have also carved out licenses for specific areas of the city as well."
        />
      </p>
    </section>
  );
};

export default LicenseType;
