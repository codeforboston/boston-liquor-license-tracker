import notFoundStyles from "./not-found.module.css";
import { FormattedMessage } from "react-intl";
import BackToHome from "@/components/ui/back-to-home";
import { useIntl } from "react-intl";
import PageHeader from "@/components/ui/pageheader";

const NotFound = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "notFound.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main className={notFoundStyles.notFound}>
      <title>{title}</title>
      <PageHeader
        cardMode={true}
        headerTitle={<FormattedMessage id="notFound.heading" />}
        headerText={<FormattedMessage id="notFound.message" />}
      >
        <BackToHome />
      </PageHeader>
    </main>
  );
};

export default NotFound;
