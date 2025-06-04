import "./breakdown-chart.css";

type BreakdownChartProps = {
  transferableLicenses: number;
  nonTransferableLicenses: number;
  allAlcoholLicenses: number;
  wineAndBeerLicenses: number;
}

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
