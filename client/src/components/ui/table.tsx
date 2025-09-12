import React, { ReactNode, useState } from 'react'
import { Table, TableHeader, Column, Row, TableBody, Cell } from 'react-aria-components'


interface RowWithSubRows {
  rowData: [string, ...string[]]
  subRowData?: [string, ...string[]][]
}

interface SubRowProps {
  subRowData: string[]
}

interface CustomTableProps {
  headers: string[]
  tableData: RowWithSubRows[]
}

const StyledRow = ({rowData, subRowData}: RowWithSubRows) => {
  const [subRowsVisible, setSubRowsVisible] = useState<boolean>(false)

  return (
    <>
      <Row
        className="bg-[#F2F2F2] border-b-[1px] border-[#E2E2E2] "
        onAction={() => setSubRowsVisible(prev => !prev)}
      >
        {rowData.map((cell, i) => (
          <Cell
            className={`${i === 0 ? "text-left" : "text-right"} px-[16px] py-[12px] `}
          >
            {cell}
          </Cell>
        ))}  
      </Row>
      {subRowsVisible && (
        subRowData?.map(subRow => (
          <SubRow subRowData={subRow}/>
        ))
      )}
    </>
    
  )
}

const SubRow = ({subRowData}: SubRowProps) => {
  return (
    <Row className='bg-[#FDFDFD] border-b-[1px] border-[#E2E2E2]'>
      {subRowData.map((cell, i) => (
        <Cell
          className={`${i === 0 ? "text-left" : "text-right"} px-[16px] pl-[48px] py-[12px] `}
        >
          {cell}
        </Cell>
      ))}
    </Row>
  )
}

const CustomTable = ({tableData, headers}: CustomTableProps) => {
  return (
    <Table className={"w-[1400px]"}>
      <TableHeader className=" bg-[#2E2E2E] text-[#FDFDFD]">
        {headers.map((header, i) => (
          <Column className={`px-[16px] py-[12px] ${i === 0 && "w-1/3 text-left"}`} isRowHeader>{header}</Column>
        ))}
      </TableHeader>
      <TableBody>
        {tableData.map(row => (
          <StyledRow rowData={row.rowData} subRowData={row.subRowData}/>
        ))}
      </TableBody>
    </Table>
  )
}

export default CustomTable
