import { FormattedMessage } from "react-intl";
import Accordion from "./accordion";
import DefinitionItem from "./definition-item";

const BasicResources = () => {

  return (
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
      <Accordion titleId="resources.basicresources.otherlicense.title">
        <DefinitionItem termId="resources.basicresources.otherlicense.2006.title" descriptionId="resources.basicresources.otherlicense.2006.description" href="https://malegislature.gov/Laws/SessionLaws/Acts/2006/Chapter383" linkLabelId="resources.basicResources.otherLicenses.law2006.link" />
        <DefinitionItem termId="resources.basicresources.otherlicense.2012.title" descriptionId="resources.basicresources.otherlicense.2012.description" href="https://malegislature.gov/Laws/SessionLaws/Acts/2012/Chapter87" linkLabelId="resources.basicResources.otherLicenses.law2012.link" />
        <DefinitionItem termId="resources.basicresources.otherlicense.2014.title" descriptionId="resources.basicresources.otherlicense.2014.description" href="https://malegislature.gov/Laws/SessionLaws/Acts/2014/Chapter287" linkLabelId="resources.basicResources.otherLicenses.law2014.link" />
        <DefinitionItem termId="resources.basicresources.otherlicense.2024.title" descriptionId="resources.basicresources.otherlicense.2024.description" href="https://malegislature.gov/Bills/193/H5039" linkLabelId="resources.basicResources.otherLicenses.law2024.link" />
        <DefinitionItem termId="resources.basicresources.otherlicense.unrestrict.title" descriptionId="resources.basicresources.otherlicense.unrestrict.description" />
      </Accordion>
    </div>
  );
};

export default BasicResources;
