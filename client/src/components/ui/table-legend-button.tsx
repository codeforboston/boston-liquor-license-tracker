import { InfoOutline } from "@mui/icons-material";
import { FormattedMessage } from "react-intl";

const TableLegendButton = () => {
  return (
    <button className="table-legend-button cursor-pointer inline-flex justify-center items-center gap-[8px] px-[16px] py-[8px] rounded-[8px] vertical-align-middle bg-background-dark">
      <span>
        <FormattedMessage id="database.table.legend" />
      </span>
      <InfoOutline className="info-icon" />
    </button>
  );
};

export default TableLegendButton;
