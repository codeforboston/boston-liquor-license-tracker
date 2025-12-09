import PageHeader from "@/components/ui/pageheader";
import BackToHome from "@components/ui/back-to-home.tsx";
import { FormattedMessage } from "react-intl";
import styles from "./coming-soon.module.css";
import { useIntl } from "react-intl";

const ComingSoon = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "comingSoon.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <section
      className={`${styles.comingSoonPage} coming-soon-page`}
      title={intl.formatMessage({ id: "comingSoon.backgroundImageAlt" })}
    >
      <title>{title}</title>

      <PageHeader
        cardMode={true}
        headerTitle={<FormattedMessage id="comingSoon.title" />}
        headerText={<FormattedMessage id="comingSoon.description" />}
      >
        <BackToHome />
      </PageHeader>
    </section>
  );
};

export default ComingSoon;
