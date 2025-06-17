import "./database-view.module.css";
import BreakdownChart from "./breakdown-chart";

const DatabaseView = () => {
  return (
    <section className="database-view">
      <h1>Database View</h1>
      <p>This is where the database content will be displayed.</p>

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
