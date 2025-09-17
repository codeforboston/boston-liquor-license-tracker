import styles from "./subheader.module.css";
import { FormattedMessage } from "react-intl";

const SubHeader = () => {
  return (
    <section className={styles.subheader}>
      <h2 className={styles.heading}>
        <FormattedMessage id="database.subheader.title"/>
     </h2>
      <p className={styles.description}>       
        <FormattedMessage  id="database.subheader.description"/>
      </p>
    </section>
  );
};

export default SubHeader;
