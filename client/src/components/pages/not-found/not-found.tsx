import notFoundStyles from "./not-found.module.css";
import { FormattedMessage } from "react-intl";
import beerTap from "@/assets/images/beer-tap.png";
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
          <h2 className="text-font-light text-2xl md:text-3xl lg:text-5xl w-full font-bold">
            <FormattedMessage id="notFound.heading" />
          </h2>
          <br />
          <p className="text-font-light">
            <FormattedMessage id="notFound.message" />
          </p>
          <br />
          <BackToHome />
        </div>
      </div>
      <img
        src={beerTap}
        className={notFoundStyles.beerTap}
        alt={intl.formatMessage({ id: "notFound.beerPourImageAlt" })}
      />
    </main>
  );
};

export default NotFound;
