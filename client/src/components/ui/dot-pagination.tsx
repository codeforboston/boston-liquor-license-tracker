import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PaginationArrow } from './Pagination';
import { useRef } from 'react';

type DotPaginationProps = {
  currentPage: number;
  totalPages: number;
  indexToZipCodes: {[key: int]: string};
  onPageChange: (page: number) => void;
}

type DotButtonProps = {
  id: number;
  isSelected: boolean;
  onSelect: (number) => void;
}

// TIL JavaScript does not have a real modulo operator
// Shoutout about.com 
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}

function DotButton({id, isSelected, onSelect}: DotButtonProps) {
  return (
    <div>
      <button
        key={id}
        id={id}
        onClick={() => onSelect(id)}
        className={
            `border border-[2px] h-[20px] min-w-[20px] cursor-pointer rounded-[100px] 
            ${isSelected ? "border-[1px] border-background-dark bg-button-default-dark text-font-light" 
            : "border-button-hovered-light hover:bg-button-hovered-light"}`}
          / >
    </div>
  );
}

function DotPagination({ currentPage, totalPages, onPageChange, indexToZipCodes }: DotPaginationProps) {

  const pageNumbers = [...Array(totalPages).keys()];

  return (
    <div style={{overflow: "hidden"}} className='flex gap-[4px]'>
      <PaginationArrow
        isDisabled={false}
        onClick={() => onPageChange((currentPage - 1).mod(totalPages))}
      >
        <ChevronLeftIcon sx={{
          fill: "var(--color-button-default-dark)"
        }} />
      </PaginationArrow>
      <div style={{overflow: "hidden", gap: "4px", display: "flex", whitespace: "nowrap"}}>
        {pageNumbers.map((page) => (
          <DotButton id={page} isSelected={currentPage === page} onSelect={onPageChange} />
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
