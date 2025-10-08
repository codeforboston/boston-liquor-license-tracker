import "./database.module.css";
import Header from "./header";
import SubHeader from "./subheader";
import LicenseType from "./license-type";
import { useIntl } from "react-intl";

const Database = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "database.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main className="database-page">
      <title>{title}</title>
      <Header />
      <SubHeader />
      <LicenseType />
    </main>
  );
};

export default Database;
