import "./database.module.css";
import mockAvailabilityData from './mock-availability-data';
import Header from "./header";
import SubHeader from "./subheader";
import CustomTable from "@components/ui/table";
import LicenseType from "./license-type";
import { useIntl } from "react-intl";

const Database = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "database.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  const availabilityHeaders = [
    'Zipcode',
    'Licenses Available', 
    'Recent Applicants',
    'Licenses Granted',
    'Total Licenses'
  ]

  return (
    <main className="database-page">
      <title>{title}</title>
      <Header />
      <SubHeader />

      <section className="license-availability-table">
        <CustomTable ariaLabel="Licenses by Zipcode" tableData={mockAvailabilityData} headers={availabilityHeaders}/>
      </section>

      <LicenseType />
    </main>
  );
};

export default Database;
