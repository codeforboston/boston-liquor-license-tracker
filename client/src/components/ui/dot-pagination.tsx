import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PaginationArrow } from './Pagination';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  indexToZipCodes: {[key: int]: string};
  onPageChange: (page: number) => void;
}

// TIL JavaScript does not have a real modulo operator
// Shoutout about.com 
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}

function DotPagination({ currentPage, totalPages, onPageChange, indexToZipCodes }: PaginationProps) {

  const pageNumbers = [...Array(totalPages).keys()];

  return (
    <div className='flex gap-[4px]'>
      <PaginationArrow
        isDisabled={false}
        onClick={() => onPageChange((currentPage - 1).mod(totalPages))}
      >
        <ChevronLeftIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </PaginationArrow>
      <div className="justify-center overflow-y-scroll items-center gap-[4px]">
      {pageNumbers.map((page) => (
        <button
          key={indexToZipCodes[page]}
          onClick={() => onPageChange(page)}
          className={
            `border border-[2px] h-[32px] min-w-[32px] cursor-pointer rounded-[4px] 
            ${currentPage === page ? "border-[1px] border-background-dark bg-button-default-dark text-font-light" 
            : "border-button-hovered-light hover:bg-button-hovered-light"}`}
        >
          {page + 1}
        </button>
      ))}
    </div>
      <PaginationArrow
        isDisabled={false}
        onClick={() => onPageChange((currentPage + 1).mod(totalPages))}
      >
        <ChevronRightIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </PaginationArrow>
    </div>
  )
}

export default DotPagination;
