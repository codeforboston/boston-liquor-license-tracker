import "./breakdown-chart.css";

type BreakdownChartProps = {
  transferableLicenses: number;
  nonTransferableLicenses: number;
  allAlcoholLicenses: number;
  wineAndBeerLicenses: number;
}


const BreakdownChart = ({
  transferableLicenses,
  nonTransferableLicenses,
  allAlcoholLicenses,
  wineAndBeerLicenses
}: BreakdownChartProps) => {
  return (
    <table className="breakdown-chart">
      <caption></caption>
      <thead>
        <tr>
          <th>License Type:</th>
          <th>Total Available</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Transferable Licenses:</td>
          <td>{transferableLicenses}</td>
        </tr>
        <tr>
          <td>Non-Transferable Licenses*:</td>
          <td>{nonTransferableLicenses}</td>
        </tr>
        <tr>
          <td>All Alcohol Licenses:</td>
          <td>{allAlcoholLicenses}</td>
        </tr>
        <tr>
          <td>Wine & Beer Licenses:</td>
          <td>{wineAndBeerLicenses}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default BreakdownChart;
