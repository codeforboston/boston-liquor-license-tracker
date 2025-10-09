import {  useState } from 'react'
import { Table, TableHeader, Column, Row, TableBody, Cell } from 'react-aria-components'


export interface RowWithSubRows {
  rowData: [string, ...string[]]
  subRowData?: [string, ...string[]][]
}

interface SubRowProps {
  subRowData: string[]
}

interface CustomTableProps {
  ariaLabel: string
  headers: string[]
  tableData: RowWithSubRows[]
}

const StyledRow = ({rowData, subRowData}: RowWithSubRows) => {
  const [subRowsVisible, setSubRowsVisible] = useState<boolean>(false)

  return (
    <>
      <Row
        className="bg-ui border-b-[1px] border-border "
        onAction={() => setSubRowsVisible(prev => !prev)}
      >
        {rowData.map((cell, i) => (
          <Cell
            key={i}
            className={`${i === 0 ? "text-left" : "text-right"} px-[16px] py-[12px] `}
          >
            {cell}
          </Cell>
        ))}  
      </Row>
      {subRowsVisible && (
        subRowData?.map(subRow => (
          <StyledSubRow 
            key={`${rowData[0]}-${subRow[0]}`} 
            subRowData={subRow}
          />
        ))
      )}
    </>
    
  )
}

const StyledSubRow = ({subRowData}: SubRowProps) => {
  return (
    <Row className='bg-light border-b-[1px] border-border'>
      {subRowData.map((cell, i) => (
        <Cell
          key={i}
          className={`${i === 0 ? "text-left" : "text-right"} px-[16px] pl-[48px] py-[12px] `}
        >
          {cell}
        </Cell>
      ))}
    </Row>
  )
}

const CustomTable = ({ariaLabel, tableData, headers}: CustomTableProps) => {
  return (
    <Table aria-label={ariaLabel} className={"w-[1400px]"}>
      <TableHeader className=" bg-dark text-light">
        {headers.map((header, i) => (
          <Column 
            key={header} 
            isRowHeader
            className={`px-[16px] py-[12px] ${i === 0 ? "w-1/3 text-left" : "text-right"}`} 
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
          />
        ))}
      </TableBody>
    </Table>
  )
}

export default CustomTable
