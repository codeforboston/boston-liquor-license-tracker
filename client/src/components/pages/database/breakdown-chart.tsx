import "./breakdown-chart.css";

type BreakdownChartProps = {
  totalLicenses: number;
  transferableLicenses: number;
  nonTransferableLicenses: number;
  allAlcoholLicenses: number;
  wineAndBeerLicenses: number;
}

// Remove this comment when implementing the component
// @ts-expect-error - scaffolding: props defined but not yet implemented
const BreakdownChart = ({
  totalLicenses,
  transferableLicenses,
  nonTransferableLicenses,
  allAlcoholLicenses,
  wineAndBeerLicenses
}: BreakdownChartProps) => {
  return (
    <table className="breakdown-chart">
      <caption></caption>
      <thead>
      </thead>
      <tbody>
      </tbody>
    </table>
  );
};

export default BreakdownChart;
