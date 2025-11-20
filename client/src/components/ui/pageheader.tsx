import styles from "./pageheader.module.css";

export const PageHeader = ({
  headerTitle,
  headerText,
  children,
  showBottomBoxShadow = false,
}: {
  headerTitle: React.ReactNode;
  headerText: React.ReactNode;
  children?: React.ReactNode;
  showBottomBoxShadow?: boolean;
}) => {
  return (
    <header className={`${styles.pageheader} ${showBottomBoxShadow && "boxshadow"}`}>
      <div className={`${styles.textContainer}`}>
        <h1 className={`${styles.headerTitle}`}>{headerTitle}</h1>
        <p className={`${styles.headerText} max-w-3xl`}>{headerText}</p>
        <div className={`${styles.headerChildren}`}>{children}</div>
      </div>
    </header>
  );
};

export default PageHeader;
