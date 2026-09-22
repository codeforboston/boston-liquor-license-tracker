import { FormattedMessage } from "react-intl";
import abccLogo from "@/assets/images/abcc-logo.jpg";
import blbLogo from "@/assets/images/blb-logo.svg";
import onsLogo from "@/assets/images/ons-logo.svg";
import AgencyCard from "./agency-card";

const Agencies = () => {
  
  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex flex-col gap-[8px]">
        <h2>
          <FormattedMessage id="resources.agencies.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.agencies.text" />
        </p>
      </div>
      <div className="flex flex-col gap-[24px]">
        <AgencyCard
          logoSrc={blbLogo}
          logoAltId="resources.agencies.blb.logoAlt"
          titleId="resources.agencies.blb.title"
          descriptionId="resources.agencies.blb.text"
          buttonLabelId="resources.agencies.blb.website"
          href="https://www.boston.gov/departments/licensing-board"
        />
        <AgencyCard
          logoSrc={abccLogo}
          logoAltId="resources.agencies.abcc.logoAlt"
          titleId="resources.agencies.abcc.title"
          descriptionId="resources.agencies.abcc.text"
          buttonLabelId="resources.agencies.abcc.website"
          href="https://www.mass.gov/orgs/alcoholic-beverages-control-commission"
        />
        <AgencyCard
          logoSrc={onsLogo}
          logoAltId="resources.agencies.ons.logoAlt"
          titleId="resources.agencies.ons.title"
          descriptionId="resources.agencies.ons.text"
          buttonLabelId="resources.agencies.ons.website"
          href="https://www.boston.gov/departments/neighborhood-services"
        />
      </div>
    </div>
  );
};

export default Agencies