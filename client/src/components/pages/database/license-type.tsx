import styles from  "./license-type.module.css";
import { FormattedMessage } from "react-intl";

const LicenseType = () => {
  return (
    <section className={styles.licenseType}>
      <h2>
        <FormattedMessage id="database.licenseTerminology.header" />
      </h2>
      <p>
        <FormattedMessage id="database.licenseTerminology.description" />
      </p>
      <h3>
        <FormattedMessage id="database.licenseTerminology.allAlcohol.title" />
      </h3>
      <p>
        <FormattedMessage id="database.licenseTerminology.allAlcohol.description" />
      </p>
      <h3>
        <FormattedMessage id="database.licenseTerminology.wineAndBeer.title" />
      </h3>
      <p>
        <FormattedMessage id="database.licenseTerminology.wineAndBeer.description" />
      </p>
      <h3>
        <FormattedMessage id="database.licenseTerminology.transferable.title" />
      </h3>
      <p>
        <FormattedMessage id="database.licenseTerminology.transferable.description" />
      </p>
      <h3>
        <FormattedMessage id="database.licenseTerminology.nonTransferable.title" />
      </h3>
      <p>
        <FormattedMessage id="database.licenseTerminology.nonTransferable.description" />
      </p>
    </section>
  );
};

export default LicenseType;
