import ResourceButton from "./resource-button";
import AgencyCard from "./agency-card";
import blbLogo from "@/assets/images/blb-logo.svg";
import abccLogo from "@/assets/images/abcc-logo.jpg";
import onsLogo from "@/assets/images/ons-logo.svg";
import styles from "./resources.module.css";
import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";
import Links from "./links";

const Resources = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "resources.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;

  return (
    <main className={`${styles.resources} flex flex-col gap-[32px]`}>
      <title>{title}</title>

      <div className="flex flex-col gap-[8px]">
        <h2>
          <FormattedMessage id="resources.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.text" />
        </p>
      </div>
      <div className="flex flex-col gap-[8px]">
        <h3>
          <FormattedMessage id="resources.cityGuides.title" />
        </h3>
        <p>
          <FormattedMessage id="resources.cityGuides.text" />
        </p>
      </div>
      <div className="flex flex-col gap-[16px]">
        <ResourceButton
          labelId="resources.blbGuideButton.website"
          href="https://www.boston.gov/departments/licensing-board/apply-alcoholic-beverages-retail-license"
          icon="link"
        />
        <ResourceButton
          labelId="resources.blbGuideButton.video"
          href="https://youtu.be/tU-u8-ii1R4?si=-KuGFiMzrtUeCNYP"
          icon="video"
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <h3>
          <FormattedMessage id="resources.offsiteGuide.title" />
        </h3>
        <p>
          <FormattedMessage id="resources.offsiteGuide.text" />
        </p>
      </div>
      <div className="flex flex-col gap-[16px]">
        <ResourceButton
          labelId="resources.offsiteGuide.website"
          href="https://docs.google.com/document/d/1lgNSyEYcxv2vo_5Oln4ZFy7RuHcDAOcsbsMSA-3FD9A/edit?usp=sharing"
          icon="link"
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <h3>
          <FormattedMessage id="resources.toast.title" />
        </h3>
        <p>
          <FormattedMessage id="resources.toast.text" />
        </p>
      </div>
      <div className="flex flex-col gap-[16px]">
        <ResourceButton
          labelId="resources.toast.website"
          href="https://pos.toasttab.com/blog/on-the-line/how-to-get-a-liquor-license-in-massachusetts?srsltid=AfmBOopAp9ZVROi0VflQVOoNoVkEuouXLzdwWoKQTQztr6FSF2Vy6Zef"
          icon="link"
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <h3>
          <FormattedMessage id="resources.agencies.title" />
        </h3>
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
      <Links />
    </main>
  );
};

export default Resources;
