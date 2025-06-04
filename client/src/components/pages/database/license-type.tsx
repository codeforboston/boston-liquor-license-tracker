import "./license-type.css";
import { FormattedMessage } from "react-intl";

const LicenseType = () => {
  return (
    <section className="license-type flex flex-col justify-center items-start m-[32px] max-w-[1440px] max-h-[640px]">
      <h2 className="font-bold text-[36pt] m-0">
        <FormattedMessage
          id="license-type.header2"
          defaultMessage={"What does each type of license mean?"}
        />
      </h2>
      <p className="mt-[8px] mb-[32px] font-normal text-[16]">
        <FormattedMessage
          id="license-type.h2-p"
          defaultMessage={
            "Boston has several different types of licenses from a variety of different laws and statues, which can lead to some confusion when applying for a license. These licenses can range from those that can be applied city-wide to licenses for specific areas of Boston. Below are some basic definitions of each license type to aid you on your search"
          }
        />
      </p>
      <h3 className="font-medium text-[32pt] m-0">
        <FormattedMessage
          id="license-type.transferable-h3"
          defaultMessage="Transferable Licenses"
        />
      </h3>
      <p className="mt-[8px] mb-[32px] font-normal text-[16]">
        <FormattedMessage
          id="license-type.transferable-p"
          defaultMessage={
            "Licenses that have no restrictions preventing them from being transferred to another business and/or another part of the city of Boston. Most of the Licenses in Boston are made of this type and all Licenses issued before 2006 will fall under this category."
          }
        />
      </p>
      <h3 className="font-medium text-[32pt]">
        <FormattedMessage
          id="license-type.nonTransferable-h3"
          defaultMessage="Non-Transferable Licenses"
        />
      </h3>
      <p className="mt-[8px] mb-[16px] font-normal text-[16]">
        <FormattedMessage
          id="license-type.nonTransferable-p"
          defaultMessage="Restrictions are placed on certain licenses preventing them from being transferred outside of their legally designated area of Boston. These licenses can come in several different forms, most notably the licenses created under the 2024 law sedignating Licenses to Several Zip Codes."
        />
      </p>
      <h4 className="font-medium text-[24pt]">
        <FormattedMessage
          id="license-type.law-h4"
          defaultMessage={"New 2024 Law"}
        />
      </h4>
      <p className="mt-[8px] mb-[16px] font-normal text-[16]">
        <FormattedMessage
          id="license-type.law-p"
          defaultMessage={
            "In 2024 the city of Boston passed a new law to increase access to lquor licenses in several parts of Boston. Through this law the city will be issuing 5 new on-premise liquor licenses to 13 of Boston's Zip Codes each year for the next 3 years."
          }
        />
      </p>
      <h4 className="font-medium text-[24pt]">
        <FormattedMessage
          id="license-type.specialAreas-h4"
          defaultMessage={"Special Areas of Boston"}
        />
      </h4>
      <p className="mt-[8px] font-normal text-[16]">
        <FormattedMessage
          id="license-type.specialAreas-p"
          defaultMessage={
            "Another provision of the 2024 law was the creation of specialty licenses for Oak Square in Brighton, several other legislations in the past have also carved out licenses for specific areas in the city as well."
          }
        />
      </p>
    </section>
  );
};

export default LicenseType;
