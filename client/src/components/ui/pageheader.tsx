import { useId, useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useIntl } from "react-intl";
import styles from "./pageheader.module.css";

export const PageHeader = ({
  headerTitle,
  headerText,
  children,
  cardMode = false,
  collapsibleOnMobile = false,
}: {
  headerTitle: React.ReactNode;
  headerText: React.ReactNode;
  children?: React.ReactNode;
  cardMode?: boolean;
  collapsibleOnMobile?: boolean;
}) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);
  const collapsibleContentId = useId();

  const headerBody = (
    <>
      <h1 className={styles.headerTitle}>{headerTitle}</h1>
      <p className={`${styles.headerText} max-w-3xl`}>{headerText}</p>
      <div className={styles.headerChildren}>{children}</div>
    </>
  );

  const content = collapsibleOnMobile ? (
    <div className={styles.collapsibleWrapper}>
      <div
        id={collapsibleContentId}
        className={`${styles.collapsibleContent} ${
          isExpanded ? styles.expanded : ""
        }`}
      >
        {headerBody}
      </div>
      <button
        type="button"
        className={styles.collapseToggle}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
        aria-controls={collapsibleContentId}
        aria-label={intl.formatMessage({
          id: isExpanded
            ? "pageHeader.collapseDescription"
            : "pageHeader.expandDescription",
        })}
      >
        {isExpanded ? (
          <ExpandLess aria-hidden="true" />
        ) : (
          <ExpandMore aria-hidden="true" />
        )}
      </button>
    </div>
  ) : (
    <div>{headerBody}</div>
  );

  return (
    <header
      className={`${styles.pageheader} ${cardMode ? styles.cardMode : ""} ${
        collapsibleOnMobile ? styles.collapsible : ""
      } ${collapsibleOnMobile && !isExpanded ? styles.collapsed : ""}`}
    >
      {cardMode ? (
        <div className={styles.infoBoxContainer}>{content}</div>
      ) : (
        content
      )}
    </header>
  );
};

export default PageHeader;
