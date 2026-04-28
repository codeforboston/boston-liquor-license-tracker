import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useCallback, useMemo } from 'react';
import styles from "./dot-pagination.module.css";

type DotPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  labels: string[];
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
  return ((x % y) + y) % y;
}

function DotButton({ id, isSelected, onSelect, tooltipLabel }: DotButtonProps) {
  const handleClick = useCallback(() => onSelect(id), [id, onSelect]);

  return (
    <div className={styles.wrapper}>
      <button
        id={id.toString()}
        type="button"
        onClick={handleClick}
        aria-label={tooltipLabel}
        aria-pressed={isSelected}
        className={
          `tooltip-on-hover border border-[2px] min-h-[12px] min-w-[12px] cursor-pointer rounded-[100px]
            ${isSelected ? "border-background-dark bg-button-default-dark text-font-light"
            : "border-button-hovered-light"}`}
      />
      {tooltipLabel && (
        <p className={styles.tooltip}>
          {tooltipLabel}
        </p>
      )}
    </div>
  );
}

function DotPagination({ currentPage, labels, totalPages, onPageChange }: DotPaginationProps) {

  const pageNumbers = useMemo(() => [...Array(totalPages).keys()], [totalPages]);

  const wrapPage = useCallback((page: number) => mod(page, totalPages), [totalPages]);

  const handleSelectPage = useCallback((page: number) => onPageChange(page), [onPageChange]);

  const handlePrevClick = useCallback(() => {
    onPageChange(wrapPage(currentPage - 1));
  }, [currentPage, onPageChange, wrapPage]);

  const handleNextClick = useCallback(() => {
    onPageChange(wrapPage(currentPage + 1));
  }, [currentPage, onPageChange, wrapPage]);

  return (
    <div className="flex justify-stretch">
      <button
        className="w-[32px] h-[32px] mr-2 mb-2 mt-2 border-[2px] border-button-hovered-light rounded-[4px] bg-background-light cursor-pointer hover:bg-button-hovered-light"
        onClick={handlePrevClick}
      >
        <ChevronLeftIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </button>
      <div
        className="flex flex-grow justify-between items-center">
        {pageNumbers.map((page) => (
          <DotButton
            id={page}
            key={page}
            isSelected={currentPage === page}
            onSelect={handleSelectPage}
            tooltipLabel={labels[page]}
          />
        ))}
      </div>
      <button
        className="w-[32px] h-[32px] mt-2 mb-2 ml-2 border-[2px] border-button-hovered-light rounded-[4px] bg-background-light cursor-pointer hover:bg-button-hovered-light"
        onClick={handleNextClick}
      >
        <ChevronRightIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </button>
    </div>
  )
}

export default DotPagination;
