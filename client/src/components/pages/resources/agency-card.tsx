import { FormattedMessage, useIntl } from "react-intl";
import ResourceButton from "./resource-button";
import styles from "./agency-card.module.css";

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
  /**
   * "icon": artwork that fills its canvas edge to edge (BLB, ONS SVGs); inset
   * so it sits inside the circle. "seal": a round logo that already has a margin.
   */
  logoVariant?: "icon" | "seal";
}

const AgencyCard = ({
  logoSrc,
  logoAltId,
  titleId,
  descriptionId,
  buttonLabelId,
  href,
  logoVariant = "seal",
}: AgencyCardProps) => {
  const intl = useIntl();
  return (
    <article className={styles.agencyCard}>
      <img
        className={`${styles.agencyLogo} ${logoVariant === "icon" ? styles.agencyLogoIcon : ""}`}
        src={logoSrc}
        alt={intl.formatMessage({ id: logoAltId })}
      />
      <h3 className={styles.agencyTitle}>
        <FormattedMessage id={titleId} />
      </h3>
      <p className={styles.agencyDescription}>
        <FormattedMessage id={descriptionId} />
      </p>
      <div className={styles.agencyButton}>
        <ResourceButton labelId={buttonLabelId} href={href} icon="link" />
      </div>
    </article>
  );
};

export default AgencyCard;