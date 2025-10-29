import "./database.module.css";
import Header from "./header";
import SubHeader from "./subheader";
import LicenseAvailabilityTable from "./license-availability-table";
import LicenseType from "./license-type";
import { useIntl } from "react-intl";
import RecentApplicationTable from "./recent-application-table";

const Database = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "database.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main className="database-page">
      <title>{title}</title>
      <Header />
      <SubHeader />
      <LicenseAvailabilityTable />
      <LicenseType />
      <RecentApplicationTable/>
    </main>
  );
};

export default Database;
