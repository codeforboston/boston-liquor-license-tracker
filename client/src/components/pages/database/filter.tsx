import "./filter.css";

type FilterProps = {
  onFilterChange: (filter: string) => void;
  filterOptions: string[];
};

const Filter = ({ onFilterChange, filterOptions }: FilterProps) => {
  return (
    <select className="filter">
    </select>
  )
}
