import styles from "./subheader.module.css";
import { FormattedMessage } from "react-intl";

const SubHeader = () => {
  return (
    <section className={styles.subheader}>
      <h2 className={styles.heading}>
        <FormattedMessage id="database.subheader.title" defaultMessage="License Availability Lookup:"/></h2>
      <p className={styles.description}>       
        <FormattedMessage  id="database.subheader.description" defaultMessage="Select a Zip Code below to see the available licenses in each area. Use the filters to narrow or expand your search to meet your exact business needs."/></p>
    </section>
  );
};

export default SubHeader;
