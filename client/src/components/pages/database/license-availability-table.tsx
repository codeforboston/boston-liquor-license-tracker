import mockAvailabilityData from './mock-availability-data';
import CustomTable from "@components/ui/table";

export default function LicenseAvailabilityTable() {
  const availabilityHeaders = [
    'Zipcode',
    'Licenses Available', 
    'Recent Applicants',
    'Licenses Granted',
    'Total Licenses'
  ]

  return (
    <section className="license-availability-table">
      <CustomTable ariaLabel="Licenses by Zipcode" tableData={mockAvailabilityData} headers={availabilityHeaders}/>
    </section>
  )
}
