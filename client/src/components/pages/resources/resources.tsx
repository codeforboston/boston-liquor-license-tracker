import Links from "./links";
import styles from "./resources.module.css";
import { FormattedMessage, useIntl } from "react-intl";

const Resources = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "resources.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;

  return (
    <main className={styles.resourcesPage}>
      <title>{title}</title>

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <FormattedMessage id="resources.pageTitle" />
        </h1>
        <p className={styles.pageDescription}>
          Information on how to apply for a license, what is needed, the
          application process, and general timelines for what happens after an
          application is submitted for a license.
        </p>
      </header>

      <Links />
    </main>
  );
};

export default Resources;
