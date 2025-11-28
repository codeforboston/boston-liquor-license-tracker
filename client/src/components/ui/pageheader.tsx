import styles from "./pageheader.module.css";

export const PageHeader = ({
  headerTitle,
  headerText,
  children,
  cardMode = false,
}: {
  headerTitle: React.ReactNode;
  headerText: React.ReactNode;
  children?: React.ReactNode;
  cardMode?: boolean;
}) => {
  const content = (
    <div>
      <h1 className={`${styles.headerTitle}`}>{headerTitle}</h1>
      <p className={`${styles.headerText} max-w-3xl`}>{headerText}</p>
      <div className={`${styles.headerChildren}`}>{children}</div>
    </div>
  );

  return (
    <header
      className={`${styles.pageheader} ${cardMode ? styles.cardMode : ""}`}
    >
      {cardMode ? (
        <div className={`${styles.infoBoxContainer}`}>{content}</div>
      ) : (
        content
      )}
    </header>
  );
};

export default PageHeader;
