import { Link } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./resources.module.css";

interface DefinitionItemProps {
  termId: string;
  descriptionId: string;
  href?: string;
  linkLabelId?: string;
}

const DefinitionItem = ({
  termId,
  descriptionId,
  href,
  linkLabelId,
}: DefinitionItemProps) => {
  const intl = useIntl();
  return (
    <div className={styles.definitionItem}>
      <h4 className={styles.definitionTerm}>
        <FormattedMessage id={termId} />
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.definitionLink} aria-label={linkLabelId ? intl.formatMessage({ id: linkLabelId }) : undefined}>
            <Link aria-hidden="true" />
          </a>
        )}
      </h4>
      <p>
        <FormattedMessage id={descriptionId} />
      </p>
    </div>
  );
};

export default DefinitionItem;