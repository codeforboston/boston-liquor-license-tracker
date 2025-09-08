import React, { ReactNode } from 'react'
import { Table, TableHeader, Column, Row, TableBody, Cell } from 'react-aria-components'



interface StyledRowProps {
  rowData: string[]
}

interface CustomTableProps {
  tableData: string[][]
}

const StyledRow = ({rowData}: StyledRowProps) => {

  return (
    <Row
      className="bg-[#F2F2F2] border-b-[1px] border-[#E2E2E2]"
    >
      {rowData.map((cell, i) => (
        <Cell
          className={`${i === 0 ? "text-left" : "text-right"} p-[16px]`}
        >
          {cell}
        </Cell>
      ))}  
    </Row>
  )
}

const CustomTable = ({tableData}: CustomTableProps) => {
  return (
    <Table>
      <TableHeader className="p-[16px] bg-[#2E2E2E] text-[#FDFDFD]">
        <Column isRowHeader>Zipcode:</Column>
        <Column isRowHeader>Licenses Available:</Column>
        <Column isRowHeader>Recent Applicants:</Column>
        <Column isRowHeader>Licenses Granted:</Column>
        <Column isRowHeader>Total Licenses:</Column>
      </TableHeader>
      <TableBody>
        {tableData.map(row => (
          <StyledRow rowData={row}/>
        ))}
      </TableBody>
    </Table>
  )
}

export default CustomTable
