import { FormattedMessage } from "react-intl";
import styles from "./resources.module.css";

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
      className={styles.linksSection}
    >
      <header className={styles.sectionHeader}>
        <h2 id="application-links-heading" className={styles.sectionTitle}>
          <FormattedMessage id="resources.links.title" />
        </h2>
        <p className={styles.sectionDescription}>
          <FormattedMessage id="resources.links.description" />
        </p>
      </header>

      <ol className={styles.linkList}>
        {applicationLinks.map((linkItem) => (
          <li key={linkItem.titleId} className={styles.linkListItem}>
            <article className={styles.linkItem}>
              <h3 className={styles.linkTitle}>
                <FormattedMessage id={linkItem.titleId} />
              </h3>

              <p className={styles.linkDescription}>
                <FormattedMessage id={linkItem.descriptionId} />
              </p>

              {linkItem.noteId ? (
                <p className={styles.linkNote}>
                  <FormattedMessage id={linkItem.noteId} />
                </p>
              ) : null}

              <a
                className={styles.resourceButton}
                href={linkItem.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FormattedMessage id={linkItem.buttonId} />
              </a>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Links;
