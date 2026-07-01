import ResourceButton from "./resource-button";
import AgencyCard from "./agency-card";
import blbLogo from "@/assets/images/blb-logo.svg";
import abccLogo from "@/assets/images/abcc-logo.jpg";
import onsLogo from "@/assets/images/ons-logo.svg";
import styles from "./resources.module.css";
import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";
import Accordion from "./accordion";
import DefinitionItem from "./definition-item";

const Resources = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "resources.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main className={`${styles.resources} flex flex-col gap-[24px]`}>
      <title>{title}</title>
      <div className="flex flex-col gap-[8px]">
        <h2>
          <FormattedMessage id="resources.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.text"/>
        </p>
      </div>
      <div className="flex flex-col gap-[8px]">
        <h2>
          <FormattedMessage id="resources.basicResources.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.basicResources.text" />
        </p>
        <Accordion titleId="resources.basicResources.glossary.title">
          <DefinitionItem termId="resources.basicResources.glossary.restricted.term" descriptionId="resources.basicResources.glossary.restricted.text" />
          <DefinitionItem termId="resources.basicResources.glossary.transferable.term" descriptionId="resources.basicResources.glossary.transferable.text" />
          <DefinitionItem termId="resources.basicResources.glossary.onPremise.term" descriptionId="resources.basicResources.glossary.onPremise.text" />
          <DefinitionItem termId="resources.basicResources.glossary.offPremise.term" descriptionId="resources.basicResources.glossary.offPremise.text" />
          <DefinitionItem termId="resources.basicResources.glossary.wineMalt.term" descriptionId="resources.basicResources.glossary.wineMalt.text" />
          <DefinitionItem termId="resources.basicResources.glossary.cordials.term" descriptionId="resources.basicResources.glossary.cordials.text" />
          <DefinitionItem termId="resources.basicResources.glossary.allAlcohol.term" descriptionId="resources.basicResources.glossary.allAlcohol.text" />
        </Accordion>
        <Accordion titleId="resources.basicResources.otherLicenses.title">
          <DefinitionItem termId="resources.basicResources.otherLicenses.law2006.term" descriptionId="resources.basicResources.otherLicenses.law2006.text" href="https://malegislature.gov/Laws/SessionLaws/Acts/2006/Chapter383" linkLabelId="resources.basicResources.otherLicenses.law2006.link" />
          <DefinitionItem termId="resources.basicResources.otherLicenses.law2012.term" descriptionId="resources.basicResources.otherLicenses.law2012.text" href="https://malegislature.gov/Laws/SessionLaws/Acts/2012/Chapter87" linkLabelId="resources.basicResources.otherLicenses.law2012.link" />
          <DefinitionItem termId="resources.basicResources.otherLicenses.law2014.term" descriptionId="resources.basicResources.otherLicenses.law2014.text" href="https://malegislature.gov/Laws/SessionLaws/Acts/2014/Chapter287" linkLabelId="resources.basicResources.otherLicenses.law2014.link" />
          <DefinitionItem termId="resources.basicResources.otherLicenses.law2024.term" descriptionId="resources.basicResources.otherLicenses.law2024.text" href="https://malegislature.gov/Bills/193/H5039" linkLabelId="resources.basicResources.otherLicenses.law2024.link" />
          <DefinitionItem termId="resources.basicResources.otherLicenses.unrestricted.term" descriptionId="resources.basicResources.otherLicenses.unrestricted.text" />
        </Accordion>
      </div>
      <div className="flex flex-col gap-[8px]">
        <h3>
          <FormattedMessage id="resources.cityGuides.title" />
        </h3>
        <p>
          <FormattedMessage id="resources.cityGuides.text"/>
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
          <FormattedMessage id="resources.offsiteGuide.text"/>
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
          <FormattedMessage id="resources.toast.text"/>
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
    </main>
  );
};

export default Resources;