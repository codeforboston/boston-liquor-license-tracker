import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import "./dot-pagination.css"

type DotPaginationProps = {
  currentPage: number;
  totalPages: number;
  indexToLabel: {[key: number]: string};
  onPageChange: (page: number) => void;
}

type DotButtonProps = {
  id: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  tooltipLabel: string;
}

// TIL JavaScript does not have a real modulo operator
// Shoutout about.com 
function mod(x: number, y: number) {
  return ((x%y)+y)%y;
}

function DotButton({id, isSelected, onSelect, tooltipLabel}: DotButtonProps) {
  return (
    <div style={{position: "relative", textAlign: "center"}}>
      <p className="tooltip bg-button-hovered-light">
        {tooltipLabel}
      </p>
      <button
        id={id.toString()}
        onClick={() => onSelect(id)}
        className={
            `tooltip-on-hover border border-[2px] h-[20px] min-w-[20px] cursor-pointer rounded-[100px] 
            ${isSelected ? "border-[1px] border-background-dark bg-button-default-dark text-font-light" 
            : "border-button-hovered-light"}`}
          / >
    </div>
  );
}

function DotPagination({ currentPage, totalPages, onPageChange, indexToLabel }: DotPaginationProps) {

  const pageNumbers = [...Array(totalPages).keys()];

  return (
    <div style={{overflow: "hidden"}} className='flex'>
      <button
        className={`min-w-[32px] mt-2 mb-2 mr-2 border-[2px] border-button-hovered-light rounded-[4px] bg-background-light cursor-pointer hover:bg-button-hovered-light`}
        onClick={() => onPageChange(mod(currentPage - 1, totalPages))}
      >
        <ChevronLeftIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </button>
      <div style={{overflow: "hidden", display: "flex", paddingBottom: "16px"}}>
        {pageNumbers.map((page) => (
          <DotButton 
            id={page} 
            key={page}
            isSelected={currentPage === page} 
            onSelect={onPageChange} 
            tooltipLabel={indexToLabel[page]} 
          />
        ))}
      </div>
      <button
        className={`min-w-[32px] mt-2 mb-2 border-[2px] border-button-hovered-light rounded-[4px] bg-background-light cursor-pointer hover:bg-button-hovered-light`}
        onClick={() => onPageChange(mod(currentPage + 1, totalPages))}
      >
        <ChevronRightIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </button>
    </div>
  )
}

export default DotPagination;
