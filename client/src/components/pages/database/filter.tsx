import "./filter.module.css";

type FilterProps = {
  onFilterChange: (filter: string) => void;
  filterOptions: string[];
};

// Remove this comment when implementing the component
// @ts-expect-error - scaffolding: props defined but not yet implemented
const Filter = ({ onFilterChange, filterOptions }: FilterProps) => {
  return <select className="filter"></select>;
};

export default Filter;
