import "./database-view.module.css";
import CustomTable from "@components/ui/table";
import RowWithSubRows from "@components/ui/table";
import mockAvailabilityData from './mock-availability-data';

const headers = [
  'Zipcode',
  'Licenses Available', 
  'Recent Applicants',
  'Licenses Granted',
  'Total Licenses'
]

const DatabaseView = () => {
  return (
    <section className="database-view">
      <h1>Database View</h1>
      <p>This is where the database content will be displayed.</p>
    
      <CustomTable ariaLabel="Licenses by Zipcode" tableData={mockAvailabilityData} headers={headers}/>
  );
};

export default DatabaseView;
