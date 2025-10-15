import mockRecentApplicationData from "./mock-recent-application-data";
import CustomTable from "@components/ui/table";

const RecentApplicationTable = () => {
  const recentApplicationHeaders = [
    'Zipcode/Business Name',
    'Dba', 
    'Street Address',
    'License Number',
    'Licenses Type',
    'App. Date',
    'Status'
  ]

  return (
    <section className="license-availability-table">
      <CustomTable ariaLabel="Licenses by Zipcode" tableData={mockRecentApplicationData} headers={recentApplicationHeaders}/>
    </section>
  )
}

export default RecentApplicationTable;
