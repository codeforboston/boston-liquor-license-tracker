import { FormattedMessage } from "react-intl";
import ResourceButton from "./resource-button";

type ResourceLinkItem = {
  titleId: string;
  descriptionId: string;

  buttonId: string;
  href: string;
};

const applicationLinks: ResourceLinkItem[] = [
  {
    titleId: "resources.applicationlinks.petitionform.title",
    descriptionId: "resources.applicationlinks.petitionform.description",
    buttonId: "resources.applicationlinks.petitionform.link",
    href: "https://www.boston.gov/departments/licensing-board/apply-liquor-license",
  },
  {
    titleId: "resources.applicationlinks.abccapplication.title",
    descriptionId: "resources.applicationlinks.abccapplication.description",
    buttonId: "resources.applicationlinks.abccapplication.link",
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
          <FormattedMessage id="resources.applicationlinks.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.applicationlinks.description" />
        </p>
      </header>

      <ol className="flex flex-col gap-[24px]">
        {applicationLinks.map((linkItem) => (
          <li key={linkItem.titleId} className="flex flex-col gap-[24px]">
            <article className="flex flex-col gap-[8px]">
              <h3>
                <FormattedMessage id={linkItem.titleId} />
              </h3>

              <p className="whitespace-pre-line">
                <FormattedMessage id={linkItem.descriptionId} />
              </p>

              <div className="mt-[16px]">
                <ResourceButton
                  labelId={linkItem.buttonId}
                  href={linkItem.href}
                  icon="link"
                />
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Links;
