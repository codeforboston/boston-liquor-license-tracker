import mockRecentApplicationData from "./mock-recent-application-data";
import CustomTable, { CellFormat } from "@components/ui/table";

// Cell formatter function - only formats status column in sub-rows
const statusCellFormatter = (
  cell: string,
  _rowIndex: number,
  cellIndex: number,
  isSubRow: boolean
): CellFormat => {
  // Only format the last column (Status - index 6) in sub-rows
  if (isSubRow && cellIndex === 6) {
    const statusStyles: Record<string, string> = {
      'Granted': 'bg-accepted text-light rounded-md px-[16px] py-[4px]',
      'Expired': 'bg-expired text-light rounded-md px-[16px] py-[4px]',
      'Deffered': 'bg-deferred text-dark rounded-md px-[16px] py-[4px]',
    }

    return {
      content: cell,
      className: statusStyles[cell] || ''
    }
  }

  // Return cell unchanged for all other cases
  return { content: cell }
}

const RecentApplicationTable = () => {
  const recentApplicationHeaders = [
    'Zipcode/Business Name',
    'Dba',
    'Street Address',
    'License Number',
    'Licenses Type',
    'App. Date',
    'Status'
  ]

  return (
    <section className="license-availability-table">
      <CustomTable
        ariaLabel="Recent License Applications by Zipcode"
        tableData={mockRecentApplicationData}
        headers={recentApplicationHeaders}
        cellFormatter={statusCellFormatter}
      />
    </section>
  )
}

export default RecentApplicationTable
