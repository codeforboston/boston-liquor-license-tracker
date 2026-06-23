import { FormattedMessage } from "react-intl";
import ResourceButton from "./resource-button";

type ResourceLinkItem = {
  titleId: string;
  descriptionId: string;
  noteId?: string;
  buttonId: string;
  href: string;
};

const applicationLinks: ResourceLinkItem[] = [
  {
    titleId: "resources.links.alcoholLicensePetitionFormTitle",
    descriptionId: "resources.links.alcoholLicensePetitionFormDescription",
    noteId: "resources.links.alcoholLicensePetitionFormNote",
    buttonId: "resources.links.alcoholLicensePetitionFormButton",
    href: "https://www.boston.gov/departments/licensing-board/apply-liquor-license",
  },
  {
    titleId: "resources.links.abccApplicationTitle",
    descriptionId: "resources.links.abccApplicationDescription",
    buttonId: "resources.links.abccApplicationButton",
    href: "https://www.mass.gov/orgs/alcoholic-beverages-control-commission",
  },
];

const Links = () => {
  return (
    <section
      aria-labelledby="application-links-heading"
      className="flex flex-col gap-[24px]"
    >
      <header className="flex flex-col gap-[8px]">
        <h2 id="application-links-heading">
          <FormattedMessage id="resources.links.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.links.description" />
        </p>
      </header>

      <ol className="flex flex-col gap-[24px]">
        {applicationLinks.map((linkItem) => (
          <li key={linkItem.titleId} className="flex flex-col gap-[24px]">
            <article className="flex flex-col gap-[8px]">
              <h3>
                <FormattedMessage id={linkItem.titleId} />
              </h3>

              <p>
                <FormattedMessage id={linkItem.descriptionId} />
              </p>

              {linkItem.noteId ? (
                <p>
                  <FormattedMessage id={linkItem.noteId} />
                </p>
              ) : null}

              <ResourceButton
                labelId={linkItem.buttonId}
                href={linkItem.href}
                icon="link"
              />
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Links;
