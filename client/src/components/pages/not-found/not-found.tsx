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
        <div className="not-found-heading">
          <h2 className="text-white text-2xl md:text-3xl lg:text-5xl w-full font-bold">
            <FormattedMessage id="notFound.heading" />
          </h2>
          <br />
          <p className="text-white">
            <FormattedMessage id="notFound.message" />
          </p>
          <br />
          <BackToHome />
        </div>
      </div>
    </main>
  );
};

export default NotFound;
