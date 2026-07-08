import { FormattedMessage, useIntl } from "react-intl";
import ResourceButton from "./resource-button";
import styles from "./resources.module.css";

interface AgencyCardProps {
  /** Imported image asset (e.g. `import blbLogo from "@/assets/images/blb-logo.svg"`) */
  logoSrc: string;
  /** alt text i18n id for the logo */
  logoAltId: string;
  /** agency name i18n id */
  titleId: string;
  /** agency description i18n id */
  descriptionId: string;
  /** label i18n id for the webpage button */
  buttonLabelId: string;
  /** external URL the webpage button points to */
  href: string;
}

const AgencyCard = ({
  logoSrc,
  logoAltId,
  titleId,
  descriptionId,
  buttonLabelId,
  href,
}: AgencyCardProps) => {
  const intl = useIntl();
  return (
    <article className={styles.agencyCard}>
      <img
        className={styles.agencyLogo}
        src={logoSrc}
        alt={intl.formatMessage({ id: logoAltId })}
      />
      <div className="flex flex-col gap-[8px]">
        <h3>
          <FormattedMessage id={titleId} />
        </h3>
        <p>
          <FormattedMessage id={descriptionId} />
        </p>
        <ResourceButton labelId={buttonLabelId} href={href} icon="link" />
      </div>
    </article>
  );
};

export default AgencyCard;