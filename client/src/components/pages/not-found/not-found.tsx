import notFoundStyles from "./not-found.module.css";
import { FormattedMessage } from "react-intl";
import BackToHome from "@/components/ui/back-to-home";
import { useIntl } from "react-intl";

const NotFound = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "notFound.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main className={notFoundStyles.notFound}>
      <title>{title}</title>
      <div className={notFoundStyles.notFoundContent}>
          <h1 className="w-full">
          <FormattedMessage id="notFound.heading" />
        </h1>
        <p>
          <FormattedMessage id="notFound.message" />
        </p>
        <BackToHome />
      </div>
    </main>
  );
};

export default NotFound;
