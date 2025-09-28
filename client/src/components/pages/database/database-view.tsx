import "./database-view.module.css";
import BreakdownChart from "./breakdown-chart";
import FilterDropdown from "@/components/ui/filter-dropdown";

const DatabaseView = () => {
  return (
    <section className="database-view">
      <h1>Database View</h1>
      <p>This is where the database content will be displayed.</p>

      <FilterDropdown title="License Type" label="License Type MultiSelect" options={[
        { id: 1, name: 'Option #1' },
        { id: 2, name: 'Option #2' },
        { id: 3, name: 'Option #3' },
      ]}/>
      {/* PLACEHOLDER */}
      <BreakdownChart
        transferableLicenses={44}
        nonTransferableLicenses={8}
        allAlcoholLicenses={46}
        wineAndBeerLicenses={46}
      />
    </section>
  );
};

export default DatabaseView;
