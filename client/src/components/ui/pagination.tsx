import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PaginationArrowProps = {
  isDisabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function PaginationArrow({ isDisabled, onClick, children, ...props }: PaginationArrowProps) {
  return (
    <button
      disabled={isDisabled}
      className={`flex justify-center items-center h-[32px] min-w-[32px] border-[2px] border-button-hovered-light rounded-[4px] bg-background-light cursor-pointer disabled:cursor-not-allowed ${!isDisabled ? "hover:bg-button-hovered-light" : ""}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className='flex justify-center overflow-y-scroll items-center gap-[4px]'>
      <PaginationArrow
        isDisabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeftIcon sx={{
          fill: currentPage === 1 ? "var(--color-button-hovered-light)" : "var(--color-button-default-dark)"
        }} />
      </PaginationArrow>
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`border border-[2px] h-[32px] min-w-[32px] cursor-pointer rounded-[4px] ${currentPage === page ? "border-[1px] border-background-dark bg-button-default-dark text-font-light" : "border-button-hovered-light hover:bg-button-hovered-light"}`}
        >
          {page}
        </button>
      ))}
      <PaginationArrow
        isDisabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRightIcon sx={{
          fill: currentPage === totalPages ? "var(--color-button-hovered-light)" : "var(--color-button-default-dark)"
        }} />
      </PaginationArrow>
    </div>
  )
}

export default Pagination
