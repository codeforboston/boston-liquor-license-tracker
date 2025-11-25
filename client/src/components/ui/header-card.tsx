import styles from "./header-card.module.css";

export const HeaderCard = ({
  headerTitle,
  headerText,
  children,
}: {
  headerTitle: React.ReactNode;
  headerText: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <header className={`${styles.headerCard}`}>
      <div className={`${styles.infoBoxContainer}`}>
        <div className={`${styles.textContainer}`}>
          <h1 className={`${styles.headerTitle}`}>{headerTitle}</h1>
          <p className={`${styles.headerText} max-w-3xl`}>{headerText}</p>
          <div className={`${styles.headerChildren}`}>{children}</div>
        </div>
      </div>
    </header>
  );
};

export default HeaderCard;
