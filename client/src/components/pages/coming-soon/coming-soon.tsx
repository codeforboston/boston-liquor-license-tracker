import PageHeader from "@components/pages/coming-soon/pageheader.tsx";
import BackToHome from "@components/ui/back-to-home.tsx";
import { FormattedMessage } from "react-intl";
import styles from "./coming-soon.module.css";
import { useIntl } from "react-intl";

const ComingSoon = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "comingSoon.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main
      className={`${styles.comingSoonPage} coming-soon-page`}
      title={intl.formatMessage({ id: "comingSoon.backgroundImageAlt" })}
    >
      <title>{title}</title>
      <PageHeader
        headerTitle={<FormattedMessage id="comingSoon.title" />}
        headerText={<FormattedMessage id="comingSoon.description" />}
      >
        <BackToHome />
      </PageHeader>
    </main>
  );
};

export default ComingSoon;
