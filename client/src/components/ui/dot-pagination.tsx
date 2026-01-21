import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PaginationArrow } from './Pagination';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  indexToZipCode: {[key: int]: string};
  onPageChange: (page: number) => void;
}

function DotPagination({ currentPage, totalPages, onPageChange, indexToZipCode }: PaginationProps) {

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className='flex gap-[4px]'>
      <PaginationArrow
        isDisabled={false}
        onClick={() => onPageChange((currentPage - 1) % totalPages)}
      >
        <ChevronLeftIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </PaginationArrow>
      <div className="justify-center overflow-y-scroll items-center gap-[4px]">
      {pageNumbers.map((page) => (
        <button
          key={indexToZipCode[page - 1]}
          onClick={() => onPageChange(page)}
          className={
            `border border-[2px] h-[32px] min-w-[32px] cursor-pointer rounded-[4px] 
            ${currentPage === page ? "border-[1px] border-background-dark bg-button-default-dark text-font-light" 
            : "border-button-hovered-light hover:bg-button-hovered-light"}`}
        >
          {page}
        </button>
      ))}
    </div>
      <PaginationArrow
        isDisabled={false}
        onClick={() => onPageChange((currentPage + 1) % totalPages)}
      >
        <ChevronRightIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </PaginationArrow>
    </div>
  )
}

export default DotPagination;
