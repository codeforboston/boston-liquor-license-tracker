import { ChevronRight } from "lucide-react";
import { FormattedMessage } from "react-intl";
import styles from "./resources.module.css";

interface AccordionProps {
  /** i18n id for the accordion header label */
  titleId: string;
  children: React.ReactNode;
}

const Accordion = ({ titleId, children }: AccordionProps) => {
  return (
    <details className={styles.accordion}>
<summary className={styles.accordionSummary}>
        <ChevronRight className={styles.accordionChevron} aria-hidden="true" />
        <span>
          <FormattedMessage id={titleId} />
        </span>
      </summary>
      <div className={styles.accordionContent}>{children}</div>
    </details>
  );
};

export default Accordion;