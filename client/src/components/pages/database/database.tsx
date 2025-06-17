import "./database.module.css";
import Header from "./header";
import SubHeader from "./subheader";
import DatabaseView from "./database-view";
import LicenseType from "./license-type";

const Database = () => {
  return (
    <main className="database-page">
      <Header />
      <SubHeader />
      <DatabaseView />
      <LicenseType />
    </main>
  );
};

export default Database;
