import { useState } from 'react'
import { Table, TableHeader, Column, Row, TableBody, Cell } from 'react-aria-components'

export interface RowWithSubRows {
  rowData: [string, ...string[]]
  subRowData?: [string, ...string[]][]
}

export interface CellFormat {
  content: string | React.ReactNode
  className?: string
}

interface SubRowProps {
  subRowData: string[]
}

export interface CustomTableProps {
  ariaLabel: string
  headers: string[]
  tableData: RowWithSubRows[]
  cellFormatter?: (cell: string, rowIndex: number, cellIndex: number, isSubRow: boolean) => CellFormat
}

const StyledRow = ({rowData, subRowData, cellFormatter}: RowWithSubRows & { cellFormatter?: CustomTableProps['cellFormatter'] }) => {
  const [subRowsVisible, setSubRowsVisible] = useState<boolean>(false)

  return (
    <>
      <Row
        className="h-[48px] bg-ui hover:bg-ui-hover border-b-[1px] border-border cursor-pointer"
        onAction={() => setSubRowsVisible(prev => !prev)}
      >
        {rowData.map((cell, i) => {
          const formatted = cellFormatter?.(cell, 0, i, false) || { content: cell }
          
          return (
            <Cell
              key={i}
              className={`${i === 0 ? "text-left" : "text-right"} ${cell === '_' ? 'text-transparent' : ''} px-[16px] py-[12px]`}
            >
                <span className={`${formatted.className || ''}`}>{formatted.content}</span>
            </Cell>
          )
        })}  
      </Row>
      {subRowsVisible && (
        subRowData?.map(subRow => (
          <StyledSubRow 
            key={`${rowData[0]}-${subRow[0]}`} 
            subRowData={subRow}
            cellFormatter={cellFormatter}
          />
        ))
      )}
    </>
  )
}

const StyledSubRow = ({subRowData, cellFormatter}: SubRowProps & { cellFormatter?: CustomTableProps['cellFormatter'] }) => {
  return (
    <Row className='bg-light border-b-[1px] border-border'>
      {subRowData.map((cell, i) => {
        const formatted = cellFormatter?.(cell, 0, i, true) || { content: cell }
        
        return (
          <Cell
            key={i}
            className={`py-[12px] text-dark ${i === 0 ? "text-left" : "text-right"} px-[16px] ${i === 0 ? 'pl-[48px]' : ''} `}
          >
            {formatted.className ? (
              <span className={formatted.className}>{formatted.content}</span>
            ) : (
              formatted.content
            )}
          </Cell>
        )
      })}
    </Row>
  )
}

const CustomTable = ({ariaLabel, tableData, headers, cellFormatter}: CustomTableProps) => {
  return (
    <Table aria-label={ariaLabel} className="w-[1400px] table-fixed">
      <TableHeader className="bg-dark text-light">
        {headers.map((header, i) => (
          <Column 
            key={header} 
            isRowHeader
            className={`px-[16px] py-[12px] ${i === 0 ? "w-1/5 text-left" : "text-right"}`} 
          >
            {header}
          </Column>
        ))}
      </TableHeader>
      <TableBody>
        {tableData.map((row) => (
          <StyledRow 
            key={row.rowData[0]}
            rowData={row.rowData} 
            subRowData={row.subRowData}
            cellFormatter={cellFormatter}
          />
        ))}
      </TableBody>
    </Table>
  )
}

export default CustomTable
